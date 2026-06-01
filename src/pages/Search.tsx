/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, HelpCircle, Film, Tv, Sparkles } from 'lucide-react';
import { searchAllMedia } from '../services/api';
import { MediaCard } from '../components/MediaCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Movie, TVShow } from '../types';

export function Search() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameter: ?q=name
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    let active = true;

    async function executeSearch() {
      if (!query.trim()) {
        if (active) {
          setMovies([]);
          setShows([]);
          setDidYouMean(null);
        }
        return;
      }

      try {
        setIsLoading(true);
        // Load up to 3 pages of search coverage as recommended
        const results = await searchAllMedia(query);
        
        if (active) {
          setMovies(results.movies);
          setShows(results.shows);
          setDidYouMean(results.didYouMean);
        }
      } catch (err) {
        console.error("Search execution failure", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      active = false;
    };
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const totalResults = movies.length + shows.length;

  return (
    <div id="search-page-root" className="min-h-screen bg-mid-bg text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Summary info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center border border-accent-blue/20">
              <SearchIcon className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h1 className="text-display text-2xl sm:text-3xl font-bold tracking-tight">Fuzzy Search Network</h1>
              <p className="text-xs text-slate-400 font-light mt-0.5">Typo-tolerant discovery with rapid indexing</p>
            </div>
          </div>

          {/* Sourcing feedback */}
          {query.trim() && (
            <p className="text-xs text-slate-400 font-mono">
              Results for: <span className="text-accent-blue font-bold">"{query}"</span>
              {!isLoading && ` (${totalResults} targets matched)`}
            </p>
          )}
        </div>

        {/* Spelling Corrector suggestion Banner ("Did you mean?") */}
        {didYouMean && !isLoading && (
          <div className="glass-card p-4 rounded-xl border border-accent-blue/25 bg-gradient-to-r from-accent-blue/10 to-transparent flex items-center gap-3 animate-fadeIn">
            <HelpCircle className="w-5 h-5 text-accent-blue flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="text-slate-300">Spelling indicator noticed. Did you mean: </span>
              <button
                onClick={() => handleSuggestionClick(didYouMean)}
                className="font-bold text-accent-blue hover:text-white underline cursor-pointer decoration-dotted underline-offset-4 ml-1 transition-colors"
              >
                {didYouMean}
              </button>
              <span className="text-slate-100">?</span>
            </div>
          </div>
        )}

        {/* Search output results */}
        {isLoading ? (
          <div className="space-y-8">
            <div className="h-6 bg-slate-800/40 rounded w-1/4 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skele-sh-${i}`} />)}
            </div>
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-24 bg-slate-900/10 rounded-2xl border border-white/5 space-y-3 p-6">
            <SearchIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">Type in the top search bar to scan terms.</p>
            <p className="text-xs text-slate-500 font-light">Typing triggers full auto-scanning of latest movies, TV shows, and genres.</p>
          </div>
        ) : totalResults > 0 ? (
          <div className="space-y-12">
            
            {/* Matching Movies section */}
            {movies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-display font-bold text-lg text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Film className="w-4 h-4 text-accent-blue" />
                  Matching Movies ({movies.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                  {movies.map(m => <MediaCard key={m.tmdb_id || m.imdb_id} item={m} />)}
                </div>
              </div>
            )}

            {/* Matching Show series section */}
            {shows.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-display font-bold text-lg text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Tv className="w-4 h-4 text-accent-purple" />
                  Matching TV series ({shows.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                  {shows.map(s => <MediaCard key={s.tmdb_id || s.imdb_id} item={s} />)}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-white/5 p-6 space-y-4">
            <Sparkles className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-300 font-semibold">No direct matches for "{query}".</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Our fuzzy search attempts to look up spelling variations and sub-genres. Try searching standard tags like ACTION, DRAMA, SCI-FI, or check for typos.</p>
            </div>
            <button
               onClick={() => navigate('/')}
               className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 text-accent-blue rounded-full transition-all"
            >
              Browse Showcase Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
