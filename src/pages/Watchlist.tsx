/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Film, Tv, Sparkles, AlertCircle } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { WatchlistItem } from '../types';

export function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const loadWatchlist = () => {
    try {
      const stored = localStorage.getItem('sv_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Synchronize dynamic watchlist changes on storage events
  useEffect(() => {
    loadWatchlist();

    const handleStorageEvent = () => loadWatchlist();
    window.addEventListener('storage', handleStorageEvent);
    
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const handleClearWatchlist = () => {
    if (window.confirm("Do you want to wipe all items from your watchlist? This action cannot be reversed.")) {
      localStorage.removeItem('sv_watchlist');
      setWatchlist([]);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div id="watchlist-page-root" className="min-h-screen bg-mid-bg text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header content and Wipe trigger button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center border border-accent-blue/20">
              <Heart className="w-5 h-5 text-accent-blue fill-current" />
            </div>
            <div>
              <h1 className="text-display text-2xl sm:text-3xl font-bold tracking-tight">Saved Watchlist</h1>
              <p className="text-xs text-slate-400 font-light mt-0.5">Quick access bookmarks synchronized in local sandbox</p>
            </div>
          </div>

          {watchlist.length > 0 && (
            <button
              onClick={handleClearWatchlist}
              className="text-xs bg-red-950/20 hover:bg-red-950/50 hover:text-red-300 border border-red-900/40 px-4 py-2 rounded-full cursor-pointer transition-colors"
            >
              Flush Watchlist
            </button>
          )}
        </div>

        {/* Watchlist responsive media display */}
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {watchlist.map((item) => (
              <MediaCard
                key={item.id}
                item={{
                  tmdb_id: item.type === 'movie' ? item.id : '',
                  imdb_id: item.type === 'tv' ? item.id : item.id,
                  title: item.title,
                  year: item.year,
                  poster_url: item.poster_url,
                  rating: item.rating,
                  genre: item.genre,
                  popularity: '',
                  type: item.type,
                  embed_url: ''
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-white/5 space-y-4 p-6">
            <Heart className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-300 font-bold text-sm">Your Watchlist is empty.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Explore blockbusters and series across our directory and hit the bookmark emblem on cards to save elements here.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                to="/movies"
                className="text-xs bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20 hover:text-white px-5 py-2 rounded-full transition"
              >
                Explore Movies
              </Link>
              <Link
                to="/tv-shows"
                className="text-xs bg-white/5 border border-white/10 text-slate-300 hover:text-white px-5 py-2 rounded-full transition"
              >
                Television Series
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
