/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Movie {
  tmdb_id: string;
  imdb_id: string;
  title: string;
  year: string;
  poster_url: string;
  rating: string;
  genre: string;
  popularity: string;
  type: 'movie';
  embed_url: string;
}

export interface TVShow {
  tmdb_id: string;
  imdb_id: string;
  title: string;
  year: string;
  poster_url: string;
  rating: string;
  genre: string;
  popularity: string;
  type: 'tv';
  embed_url: string;
}

export interface Episode {
  show_tmdb_id: string;
  show_imdb_id: string;
  season_number: string;
  episode_number: string;
  episode_title: string;
  air_date: string;
  show_title: string;
  type: 'episode';
  embed_url: string;
}

export interface WatchlistItem {
  id: string; // tmdb_id or imdb_id
  title: string;
  poster_url: string;
  rating: string;
  year: string;
  type: 'movie' | 'tv';
  genre: string;
  addedAt: number;
}

export interface WatchHistoryItem {
  id: string; // imdb_id or tmdb_id
  title: string;
  poster_url: string;
  type: 'movie' | 'tv';
  lastWatchedAt: number;
  progress: number; // in seconds
  duration: number; // in seconds
  season?: string; // TV only
  episode?: string; // TV only
}

export interface PlayerProgress {
  progress: number; // current time in seconds
  duration: number; // total duration
  lastUpdated: number;
  season?: string;
  episode?: string;
}
