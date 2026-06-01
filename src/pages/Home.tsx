/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Tv, Film, Star } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';
import { MediaCard } from '../components/MediaCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { fetchAllMovies, fetchAllTVShows, fetchAllEpisodes } from '../services/api';
import { Movie, TVShow, Episode } from '../types';

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [fetchedMovies, fetchedShows, fetchedEpisodes] = await Promise.all([
          fetchAllMovies(1), // Load page 1 for Home speed
          fetchAllTVShows(1),
          fetchAllEpisodes(1)
        ]);

        if (active) {
          setMovies(fetchedMovies);
          setShows(fetchedShows);
          setEpisodes(fetchedEpisodes);
        }
      } catch (err) {
        console.error("Failed to fetch homepage rows", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Assemble featured spotlight items
  const spotlightItems = [...movies.slice(0, 3), ...shows.slice(0, 2)];

  return (
    <div id="homepage-root" className="min-h-screen bg-mid-bg text-white pb-16">
      
      {/* Banner Billboard spotlight */}
      <HeroBanner items={spotlightItems} />

      {/* Media rows with skeleton states */}
      <div className="mt-6 space-y-6">
        
        {/* LATEST MOVIES SECTION */}
        <MediaRow
          id="latest-movies"
          title="Latest Blockbusters"
          subtitle="Direct, ad-free embeds of newly released theatrical captures"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`mov-skele-${i}`} />)
          ) : movies.length > 0 ? (
            movies.map(m => <MediaCard key={m.tmdb_id || m.imdb_id} item={m} />)
          ) : (
            <div className="text-slate-500 text-sm py-8 font-mono">No movies currently loaded.</div>
          )}
        </MediaRow>

        {/* LATEST TV SHOWS SECTION */}
        <MediaRow
          id="latest-shows"
          title="Latest TV Series"
          subtitle="Full premium seasons with multi-language subtitle finders"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`tv-skele-${i}`} />)
          ) : shows.length > 0 ? (
            shows.map(s => <MediaCard key={s.tmdb_id || s.imdb_id} item={s} />)
          ) : (
            <div className="text-slate-500 text-sm py-8 font-mono">No TV shows loaded.</div>
          )}
        </MediaRow>

        {/* NEW EPISODES FEED SECTION */}
        <div id="new-episodes-row" className="group/row my-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-4">
            <h2 className="text-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              New Episode Airings
              <span className="w-1.5 h-1.5 rounded-full bg-accent-purple inline-block animate-bounce" />
            </h2>
            <p className="text-xs text-slate-400 font-light mt-0.5">Watch newly aired episodes with auto-next controls</p>
          </div>

          <div
            className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`ep-skele-${i}`} className="w-64 h-36 flex-shrink-0 animate-pulse bg-slate-800/40 rounded-xl" />
              ))
            ) : episodes.length > 0 ? (
              episodes.slice(0, 12).map((ep, idx) => {
                const epId = ep.show_tmdb_id || ep.show_imdb_id;
                return (
                  <Link
                    key={`${epId}-${ep.season_number}-${ep.episode_number}-${idx}`}
                    to={`/watch/tv/${epId}?season=${ep.season_number}&episode=${ep.episode_number}`}
                    className="group relative w-64 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-card-bg border border-white/5 p-3 flex flex-col justify-between glass card-hover select-none cursor-pointer"
                  >
                    {/* Top Episode Number badge */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-[#A855F7] bg-[#A855F7]/10 px-2 py-0.5 rounded border border-[#A855F7]/25">
                        Season {ep.season_number} • Ep {ep.episode_number}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-accent-purple/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-accent-purple fill-accent-purple" />
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-mono line-clamp-1">{ep.show_title}</p>
                      <h3 className="text-sm font-semibold tracking-wide text-white line-clamp-1 group-hover:text-accent-purple transition-all leading-tight">
                        {ep.episode_title || `Episode ${ep.episode_number}`}
                      </h3>
                      {ep.air_date && (
                        <span className="text-[9px] text-slate-500 font-light block">{ep.air_date}</span>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-slate-500 text-sm py-8 font-mono">No episode airings found.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
