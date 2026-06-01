/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, TVShow, Episode } from './types';

export const FALLBACK_MOVIES: Movie[] = [
  {
    tmdb_id: "385687",
    imdb_id: "tt1517268",
    title: "Fast X",
    year: "2023",
    poster_url: "https://image.tmdb.org/t/p/w500/fiVWbHmgTu975uep2SgNZH6vBkI.jpg",
    rating: "7.1",
    genre: "Action, Crime, Thriller",
    popularity: "2847.12",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt1517268"
  },
  {
    tmdb_id: "872585",
    imdb_id: "tt15398710",
    title: "Oppenheimer",
    year: "2023",
    poster_url: "https://image.tmdb.org/t/p/w500/8Gxv2Z7HqD6g37ST89R3SgOBZGl.jpg",
    rating: "8.9",
    genre: "Drama, History, Biography",
    popularity: "1985.45",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt15398710"
  },
  {
    tmdb_id: "693134",
    imdb_id: "tt15239678",
    title: "Dune: Part Two",
    year: "2024",
    poster_url: "https://image.tmdb.org/t/p/w500/czbb67ALlGIUIZ36R6Go9n6mCHb.jpg",
    rating: "8.6",
    genre: "Sci-Fi, Adventure, Action",
    popularity: "2450.40",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt15239678"
  },
  {
    tmdb_id: "533535",
    imdb_id: "tt6263850",
    title: "Deadpool & Wolverine",
    year: "2024",
    poster_url: "https://image.tmdb.org/t/p/w500/8cdWv0LR39vH7of6k6gH6H6YVNK.jpg",
    rating: "7.9",
    genre: "Action, Comedy, Sci-Fi",
    popularity: "3120.15",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt6263850"
  },
  {
    tmdb_id: "1022789",
    imdb_id: "tt22022452",
    title: "Inside Out 2",
    year: "2024",
    poster_url: "https://image.tmdb.org/t/p/w500/vpnVM9b6mI8vU6hoZfwx6HzO67u.jpg",
    rating: "8.0",
    genre: "Animation, Comedy, Family",
    popularity: "2200.50",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt22022452"
  },
  {
    tmdb_id: "76600",
    imdb_id: "tt1630029",
    title: "Avatar: The Way of Water",
    year: "2022",
    poster_url: "https://image.tmdb.org/t/p/w500/t68m7ZUI0E6v6goV0GRYv6alCgS.jpg",
    rating: "7.6",
    genre: "Sci-Fi, Adventure, Action",
    popularity: "1542.10",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt1630029"
  },
  {
    tmdb_id: "558449",
    imdb_id: "tt9669730",
    title: "Gladiator II",
    year: "2024",
    poster_url: "https://image.tmdb.org/t/p/w500/od9866TyGlA6q6Z6g9XgTqgD9XN.jpg",
    rating: "7.2",
    genre: "Action, Drama, History",
    popularity: "1890.30",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt9669730"
  },
  {
    tmdb_id: "157336",
    imdb_id: "tt0816692",
    title: "Interstellar",
    year: "2014",
    poster_url: "https://image.tmdb.org/t/p/w500/gEU2Qv6G63gI6tyZvOI7V2Vf669.jpg",
    rating: "8.7",
    genre: "Sci-Fi, Drama, Adventure",
    popularity: "982.70",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt0816692"
  },
  {
    tmdb_id: "27205",
    imdb_id: "tt1375666",
    title: "Inception",
    year: "2010",
    poster_url: "https://image.tmdb.org/t/p/w500/o066urY48VAs9ofT69n6DAn63gA.jpg",
    rating: "8.8",
    genre: "Action, Sci-Fi, Thriller",
    popularity: "845.60",
    type: "movie",
    embed_url: "https://vaplayer.ru/embed/movie/tt1375666"
  }
];

export const FALLBACK_TV_SHOWS: TVShow[] = [
  {
    tmdb_id: "1399",
    imdb_id: "tt0944947",
    title: "Game of Thrones",
    year: "2011",
    poster_url: "https://image.tmdb.org/t/p/w500/1XS19CfS3g7bI6HQpRLgZid9m6S.jpg",
    rating: "8.4",
    genre: "Sci-Fi & Fantasy, Drama, Action & Adventure",
    popularity: "985.45",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt0944947"
  },
  {
    tmdb_id: "1396",
    imdb_id: "tt0959621",
    title: "Breaking Bad",
    year: "2008",
    poster_url: "https://image.tmdb.org/t/p/w500/ztkUQv6v19v99G96aC669G06gH6.jpg",
    rating: "9.5",
    genre: "Drama, Crime, Thriller",
    popularity: "875.20",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt0959621"
  },
  {
    tmdb_id: "66732",
    imdb_id: "tt4574334",
    title: "Stranger Things",
    year: "2016",
    poster_url: "https://image.tmdb.org/t/p/w500/49W6gOCYm896XfScaS2g67f67gO.jpg",
    rating: "8.7",
    genre: "Sci-Fi, Drama, Mystery",
    popularity: "1105.15",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt4574334"
  },
  {
    tmdb_id: "119051",
    imdb_id: "tt13443470",
    title: "Wednesday",
    year: "2022",
    poster_url: "https://image.tmdb.org/t/p/w500/9PF6s33Gg8G63GI6aX8Xf67gO.jpg",
    rating: "8.5",
    genre: "Fantasy, Comedy, Mystery",
    popularity: "753.80",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt13443470"
  },
  {
    tmdb_id: "100088",
    imdb_id: "tt3581920",
    title: "The Last of Us",
    year: "2023",
    poster_url: "https://image.tmdb.org/t/p/w500/uKVFLg6gK8Xf67gOlGf6gH6YVNK.jpg",
    rating: "8.8",
    genre: "Action, Drama, Sci-Fi & Fantasy",
    popularity: "942.30",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt3581920"
  },
  {
    tmdb_id: "125134",
    imdb_id: "tt12643504",
    title: "Fallout",
    year: "2024",
    poster_url: "https://image.tmdb.org/t/p/w500/2mLa97YJW8Y6v6goV1Gg9YVJOHG.jpg",
    rating: "8.4",
    genre: "Sci-Fi, Action, Adventure",
    popularity: "1350.20",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt12643504"
  },
  {
    tmdb_id: "94997",
    imdb_id: "tt11198330",
    title: "House of the Dragon",
    year: "2022",
    poster_url: "https://image.tmdb.org/t/p/w500/7Ry66fG63gI6tyZvOI7V2Vf669.jpg",
    rating: "8.5",
    genre: "Sci-Fi & Fantasy, Drama, Action & Adventure",
    popularity: "1102.50",
    type: "tv",
    embed_url: "https://vaplayer.ru/embed/tv/tt11198330"
  }
];

export const FALLBACK_EPISODES: Episode[] = [
  {
    show_tmdb_id: "1399",
    show_imdb_id: "tt0944947",
    season_number: "1",
    episode_number: "1",
    episode_title: "Winter Is Coming",
    air_date: "2011-04-17",
    show_title: "Game of Thrones",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt0944947/1/1"
  },
  {
    show_tmdb_id: "1399",
    show_imdb_id: "tt0944947",
    season_number: "1",
    episode_number: "2",
    episode_title: "The Kingsroad",
    air_date: "2011-04-24",
    show_title: "Game of Thrones",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt0944947/1/2"
  },
  {
    show_tmdb_id: "1399",
    show_imdb_id: "tt0944947",
    season_number: "1",
    episode_number: "3",
    episode_title: "Lord Snow",
    air_date: "2011-05-01",
    show_title: "Game of Thrones",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt0944947/1/3"
  },
  {
    show_tmdb_id: "1399",
    show_imdb_id: "tt0944947",
    season_number: "1",
    episode_number: "4",
    episode_title: "Cripples, Bastards, and Broken Things",
    air_date: "2011-05-08",
    show_title: "Game of Thrones",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt0944947/1/4"
  },
  {
    show_tmdb_id: "125134",
    show_imdb_id: "tt12643504",
    season_number: "1",
    episode_number: "1",
    episode_title: "The End",
    air_date: "2024-04-10",
    show_title: "Fallout",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt12643504/1/1"
  },
  {
    show_tmdb_id: "125134",
    show_imdb_id: "tt12643504",
    season_number: "1",
    episode_number: "2",
    episode_title: "The Target",
    air_date: "2024-04-10",
    show_title: "Fallout",
    type: "episode",
    embed_url: "https://vaplayer.ru/embed/tv/tt12643504/1/2"
  }
];
