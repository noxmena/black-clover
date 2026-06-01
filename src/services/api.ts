/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, TVShow, Episode } from '../types';
import { FALLBACK_MOVIES, FALLBACK_TV_SHOWS, FALLBACK_EPISODES } from '../fallbackData';

// Global memory cache to prevent duplicate request storms
let cachedMovies: Movie[] = [];
let cachedTVShows: TVShow[] = [];
let cachedEpisodes: Episode[] = [];

/**
 * Levenshtein Distance Algorithm for typo tolerance
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  const cleanA = a.toLowerCase().trim();
  const cleanB = b.toLowerCase().trim();

  if (cleanA.length === 0) return cleanB.length;
  if (cleanB.length === 0) return cleanA.length;

  for (let i = 0; i <= cleanB.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= cleanA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= cleanB.length; i++) {
    for (let j = 1; j <= cleanA.length; j++) {
      if (cleanB.charAt(i - 1) === cleanA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[cleanB.length][cleanA.length];
}

/**
 * Find the closest spelling suggestion from catalog items
 */
export function getDidYouMeanSuggestion(query: string, itemsList: Array<{ title: string }>): string | null {
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length < 2) return null;

  let bestMatch: string | null = null;
  let minDistance = 5; // Allow maximum 4 edits for suggestion

  // Don't suggest if query is already an exact substring match
  const exactOrSubstringExists = itemsList.some(
    item => item.title.toLowerCase().includes(cleanQuery)
  );
  if (exactOrSubstringExists) return null;

  for (const item of itemsList) {
    const title = item.title;
    const distance = getLevenshteinDistance(cleanQuery, title);

    if (distance > 0 && distance < minDistance) {
      minDistance = distance;
      bestMatch = title;
    }
  }

  return bestMatch;
}

/**
 * Fetch Movies spanning up to 3 pages
 */
export async function fetchAllMovies(maxPages = 3): Promise<Movie[]> {
  if (cachedMovies.length > 0) return cachedMovies;

  const movies: Movie[] = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(`https://vidapi.ru/movies/latest/page-${page}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        movies.push(...data.items);
      }
    }
    // Remove duplicates if any
    const uniqueMap = new Map<string, Movie>();
    movies.forEach(m => uniqueMap.set(m.tmdb_id || m.imdb_id, m));
    cachedMovies = Array.from(uniqueMap.values());
  } catch (error) {
    console.warn("VidAPI Movie fetch error (likely CORS or Offline), falling back to offline preset data:", error);
    // Use fallback
    cachedMovies = [...FALLBACK_MOVIES];
  }

  return cachedMovies;
}

/**
 * Fetch TV Shows spanning up to 3 pages
 */
export async function fetchAllTVShows(maxPages = 3): Promise<TVShow[]> {
  if (cachedTVShows.length > 0) return cachedTVShows;

  const shows: TVShow[] = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://vidapi.ru/tvshows/latest/page-${page}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        shows.push(...data.items);
      }
    }
    const uniqueMap = new Map<string, TVShow>();
    shows.forEach(s => uniqueMap.set(s.tmdb_id || s.imdb_id, s));
    cachedTVShows = Array.from(uniqueMap.values());
  } catch (error) {
    console.warn("VidAPI TV Show fetch error (likely CORS or Offline), falling back to offline preset data:", error);
    cachedTVShows = [...FALLBACK_TV_SHOWS];
  }

  return cachedTVShows;
}

/**
 * Fetch Episodes spanning up to 3 pages
 */
export async function fetchAllEpisodes(maxPages = 3): Promise<Episode[]> {
  if (cachedEpisodes.length > 0) return cachedEpisodes;

  const episodes: Episode[] = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://vidapi.ru/episodes/latest/page-${page}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        episodes.push(...data.items);
      }
    }
    // Normalize data structure
    const mapped = episodes.map(item => ({
      ...item,
      type: 'episode' as const
    }));
    cachedEpisodes = mapped;
  } catch (error) {
    console.warn("VidAPI Episode fetch error, falling back to offline preset data:", error);
    cachedEpisodes = [...FALLBACK_EPISODES];
  }

  return cachedEpisodes;
}

/**
 * Dynamic lookup of media details from backend server or local offline collection
 */
export async function getMediaById(type: string, id: string): Promise<Movie | TVShow | null> {
  try {
    const response = await fetch(`/api/media/${type}/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`Dynamic lookup of ${type}/${id} failed, falling back to local database.`, err);
  }

  // Fallback
  if (type === 'movie') {
    const movies = await fetchAllMovies();
    return movies.find(m => m.tmdb_id === id || m.imdb_id === id) || null;
  } else {
    const shows = await fetchAllTVShows();
    return shows.find(s => s.tmdb_id === id || s.imdb_id === id) || null;
  }
}

/**
 * Unified Search spanning both movies and tv shows
 */
export async function searchAllMedia(query: string): Promise<{
  movies: Movie[];
  shows: TVShow[];
  didYouMean: string | null;
}> {
  // 1. Try backend API search first for real-time dynamic IMDb queries
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && (Array.isArray(data.movies) || Array.isArray(data.shows))) {
        return {
          movies: data.movies || [],
          shows: data.shows || [],
          didYouMean: null
        };
      }
    }
  } catch (err) {
    console.warn("Backend dynamic search failed or offline, falling back to local fuzzy search:", err);
  }

  // 2. Client-side local lookup if offline or if backend fails
  const movies = await fetchAllMovies();
  const shows = await fetchAllTVShows();

  const cleanQuery = query.toLowerCase().trim();

  // Simple substring filter
  const filteredMovies = movies.filter(
    m => m.title.toLowerCase().includes(cleanQuery) || m.genre.toLowerCase().includes(cleanQuery)
  );

  const filteredShows = shows.filter(
    s => s.title.toLowerCase().includes(cleanQuery) || s.genre.toLowerCase().includes(cleanQuery)
  );

  // Compile full universe of items for spelling check
  const allItems = [...movies, ...shows];
  const didYouMean = getDidYouMeanSuggestion(query, allItems);

  return {
    movies: filteredMovies,
    shows: filteredShows,
    didYouMean
  };
}
