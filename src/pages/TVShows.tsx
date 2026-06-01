/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Tv, RefreshCw } from 'lucide-react';
import { FilterBar } from '../components/FilterBar';
import { MediaCard } from '../components/MediaCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { fetchAllTVShows } from '../services/api';
import { TVShow } from '../types';

export function TVShows() {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPagesAvailable, setMaxPagesAvailable] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');

  useEffect(() => {
    async function loadInitial() {
      try {
        setIsLoading(true);
        const data = await fetchAllTVShows(1);
        setShows(data);
      } catch (err) {
        console.error("Could not load initial TV shows list", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const handleLoadMore = async () => {
    if (currentPage >= maxPagesAvailable || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await fetchAllTVShows(nextPage);
      setShows(data);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const availableYears = Array.from(new Set<string>(shows.map(s => s.year).filter(Boolean)));
  const availableGenres = Array.from(
    new Set<string>(shows.flatMap(s => s.genre ? s.genre.split(',').map(g => g.trim()) : []))
  );

  const filteredShows = shows.filter(s => {
    const genreMatch = selectedGenre === 'All' || 
      (s.genre && s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    
    const yearMatch = selectedYear === 'All' || s.year === selectedYear;
    
    const ratingNum = parseFloat(s.rating || '0');
    const threshold = selectedRating === 'All' ? 0 : parseFloat(selectedRating);
    const ratingMatch = ratingNum >= threshold;

    return genreMatch && yearMatch && ratingMatch;
  });

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedRating('All');
  };

  return (
    <div id="tvshows-page-root" className="min-h-screen bg-mid-bg text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center border border-accent-purple/20">
            <Tv className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="text-display text-2xl sm:text-3xl font-bold tracking-tight">Television Catalog</h1>
            <p className="text-xs text-slate-400 font-light mt-0.5">Stream curated high-definition television blockbusters</p>
          </div>
        </div>

        {/* Filter Selection Panel */}
        <FilterBar
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          availableGenres={availableGenres}
          availableYears={availableYears}
          onReset={handleResetFilters}
        />

        {/* Grid List */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`tv-skel-${i}`} />)}
            </div>
          ) : filteredShows.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
              {filteredShows.map(s => (
                <MediaCard key={s.tmdb_id || s.imdb_id} item={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-white/5 p-6 space-y-2">
              <p className="text-slate-400 font-medium">No TV shows match your filters.</p>
              <button
                onClick={handleResetFilters}
                className="text-xs text-accent-blue hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {currentPage < maxPagesAvailable && !isLoading && filteredShows.length > 0 && (
          <div className="flex justify-center pt-8 border-t border-white/5">
            <button
               onClick={handleLoadMore}
               disabled={isLoadingMore}
               className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 border border-white/10 px-8 py-3 rounded-full text-xs font-semibold hover:border-accent-purple/30 active:scale-95 hover:shadow-lg transition-all text-slate-200 hover:text-white cursor-pointer disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin text-accent-purple" />
                  Sourcing Streams...
                </>
              ) : (
                "Load More TV Shows"
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
