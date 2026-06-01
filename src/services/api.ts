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

let moviePagesFetched = 0;
let tvPagesFetched = 0;

function generateProceduralMovies(count: number, startIdIndex: number): Movie[] {
  const titles = [
    "The Dark Knight Rises", "The Batman", "Captain America: Brave New World", "Spider-Man: Beyond the Spider-Verse", 
    "Avatar: Fire and Ash", "Kingdom of the Planet of the Apes", "Blade Runner 2049", "The Godfather", "The Godfather: Part II",
    "Pulp Fiction", "Schindler's List", "12 Angry Men", "Spirited Away", "Whiplash", "Parasite", "The Prestige",
    "Django Unchained", "The Departed", "Gladiator", "The Lion King", "WALL-E", "Up", "Guardians of the Galaxy Vol. 3",
    "Avengers: Infinity War", "Spider-Man: Homecoming", "Blade Runner", "Star Wars: A New Hope", "The Empire Strikes Back",
    "Return of the Jedi", "The Shining", "Alien", "Aliens", "Psycho", "Fight Club", "Casablanca"
  ];
  const genres = [
    "Action, Sci-Fi", "Action, Adventure", "Animation, Action", "Drama, Crime", "Sci-Fi, Adventure", "Drama, Biography",
    "Action, Thriller", "Adventure, Fantasy", "Comedy, Drama", "Horror, Mystery", "Sci-Fi, Thriller"
  ];
  const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  const list: Movie[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIdIndex + i;
    const baseTitle = titles[idx % titles.length];
    const suffixGroup = Math.floor(idx / titles.length);
    const title = suffixGroup > 0 ? `${baseTitle} (Part ${suffixGroup + 1})` : baseTitle;
    const genre = genres[(idx * 3) % genres.length];
    const year = years[(idx * 7) % years.length];
    const rating = (7.0 + ((idx * 13) % 26) / 10).toFixed(1);
    const tmdbId = String(100000 + idx);
    const imdbId = `tt${1234567 + idx}`;
    const popularity = (500 + ((idx * 23) % 2500)).toFixed(2);
    const posterUrls = [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500",
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
      "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500"
    ];

    list.push({
      tmdb_id: tmdbId,
      imdb_id: imdbId,
      title,
      year,
      poster_url: posterUrls[idx % posterUrls.length],
      rating,
      genre,
      popularity,
      type: "movie",
      embed_url: `https://vaplayer.ru/embed/movie/${imdbId}`
    });
  }
  return list;
}

function generateProceduralTVShows(count: number, startIdIndex: number): TVShow[] {
  const titles = [
    "Better Call Saul", "The Sopranos", "The Wire", "Rick and Morty", "Sherlock", "Fargo", "True Detective", "The Crown",
    "The Boys", "Invincible", "The Bear", "Shogun", "Andor", "The Mandalorian", "Loki", "Severance", "Succession",
    "Ted Lasso", "Reacher", "Black Mirror", "Peaky Blinders", "Narcos", "Dark", "Mindhunter", "The Witcher", "The Penguin",
    "Dune: Prophecy", "Agatha All Along", "Daredevil: Born Again"
  ];
  const genres = [
    "Drama, Crime", "Sci-Fi & Fantasy, Action & Adventure", "Drama, Mystery", "Sci-Fi & Fantasy, Action", "Comedy, Drama",
    "Action & Adventure, Crime", "Drama, Thriller", "Sci-Fi, Thriller"
  ];
  const years = ["2015", "2018", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  const list: TVShow[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIdIndex + i;
    const baseTitle = titles[idx % titles.length];
    const suffixGroup = Math.floor(idx / titles.length);
    const title = suffixGroup > 0 ? `${baseTitle} (Season ${suffixGroup + 1})` : baseTitle;
    const genre = genres[(idx * 3) % genres.length];
    const year = years[(idx * 7) % years.length];
    const rating = (7.0 + ((idx * 11) % 26) / 10).toFixed(1);
    const tmdbId = String(200000 + idx);
    const imdbId = `tt${2345678 + idx}`;
    const popularity = (500 + ((idx * 19) % 2000)).toFixed(2);
    const posterUrls = [
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
      "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500"
    ];

    list.push({
      tmdb_id: tmdbId,
      imdb_id: imdbId,
      title,
      year,
      poster_url: posterUrls[(idx + 2) % posterUrls.length],
      rating,
      genre,
      popularity,
      type: "tv",
      embed_url: `https://vaplayer.ru/embed/tv/${imdbId}`
    });
  }
  return list;
}

/**
 * Fetch Movies spanning up to 3 pages
 */
export async function fetchAllMovies(maxPages = 3): Promise<Movie[]> {
  if (moviePagesFetched >= maxPages && cachedMovies.length > 0) {
    return cachedMovies;
  }

  if (cachedMovies.length === 0) {
    cachedMovies = [...FALLBACK_MOVIES];
    moviePagesFetched = 1;
  }

  for (let page = moviePagesFetched + 1; page <= maxPages; page++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(`https://vidapi.ru/movies/latest/page-${page}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        cachedMovies.push(...data.items);
      }
    } catch (error) {
      console.warn(`VidAPI Movie Page ${page} fetch error, appending rich fallback movies.`);
      // Append 15 distinctive procedural films starting at correct offset
      const extras = generateProceduralMovies(15, (page - 2) * 15 + 1);
      cachedMovies.push(...extras);
    }
  }

  // De-duplicate
  const uniqueMap = new Map<string, Movie>();
  cachedMovies.forEach(m => uniqueMap.set(m.tmdb_id || m.imdb_id, m));
  cachedMovies = Array.from(uniqueMap.values());
  moviePagesFetched = Math.max(moviePagesFetched, maxPages);

  return cachedMovies;
}

/**
 * Fetch TV Shows spanning up to 3 pages
 */
export async function fetchAllTVShows(maxPages = 3): Promise<TVShow[]> {
  if (tvPagesFetched >= maxPages && cachedTVShows.length > 0) {
    return cachedTVShows;
  }

  if (cachedTVShows.length === 0) {
    cachedTVShows = [...FALLBACK_TV_SHOWS];
    tvPagesFetched = 1;
  }

  for (let page = tvPagesFetched + 1; page <= maxPages; page++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://vidapi.ru/tvshows/latest/page-${page}.json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        cachedTVShows.push(...data.items);
      }
    } catch (error) {
      console.warn(`VidAPI TV Show Page ${page} fetch error, appending rich fallback TV Shows.`);
      const extras = generateProceduralTVShows(15, (page - 2) * 15 + 1);
      cachedTVShows.push(...extras);
    }
  }

  const uniqueMap = new Map<string, TVShow>();
  cachedTVShows.forEach(s => uniqueMap.set(s.tmdb_id || s.imdb_id, s));
  cachedTVShows = Array.from(uniqueMap.values());
  tvPagesFetched = Math.max(tvPagesFetched, maxPages);

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
