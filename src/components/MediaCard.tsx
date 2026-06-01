/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { Movie, TVShow } from '../types';

interface MediaCardProps {
  item: Movie | TVShow;
  key?: string | number;
}

export function MediaCard({ item }: MediaCardProps) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const type = item.type;
  const itemId = item.tmdb_id || item.imdb_id;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sv_watchlist');
      if (stored) {
        const watchlist = JSON.parse(stored);
        const hasItem = watchlist.some((elem: any) => elem.id === itemId);
        setIsBookmarked(hasItem);
      }
    } catch (e) {
      console.error("LocalStorage error", e);
    }
  }, [itemId]);

  const toggleBookmark = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem('sv_watchlist') || '[]';
      let watchlist = JSON.parse(stored);
      const exists = watchlist.some((elem: any) => elem.id === itemId);

      if (exists) {
        watchlist = watchlist.filter((elem: any) => elem.id !== itemId);
        setIsBookmarked(false);
      } else {
        watchlist.push({
          id: itemId,
          title: item.title,
          poster_url: item.poster_url,
          rating: item.rating,
          year: item.year,
          type: item.type,
          genre: item.genre,
          addedAt: Date.now()
        });
        setIsBookmarked(true);
      }

      localStorage.setItem('sv_watchlist', JSON.stringify(watchlist));
      // Dispatch a storage event to synchronize lists in real-time
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error("Failed to update watchlist", err);
    }
  };

  const detailUrl = `/detail/${type}/${itemId}`;

  return (
    <Link
      id={`media-card-${itemId}`}
      to={detailUrl}
      className="group relative flex flex-col w-44 sm:w-48 flex-shrink-0 card-hover bg-card-bg rounded-xl overflow-hidden glass p-2.5 border border-white/5 cursor-pointer select-none"
    >
      {/* 2:3 Aspect Ratio Image Frame */}
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-slate-900/40">
        <img
          src={item.poster_url || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=60"}
          alt={item.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Action Overlay with Play symbol */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-accent-blue/95 hover:bg-accent-blue rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-mid-bg fill-current ml-0.5" />
          </div>
        </div>

        {/* Floating Accent Type Badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${
          type === 'movie' 
            ? 'bg-gradient-to-r from-accent-blue to-cyan-500 text-mid-bg'
            : 'bg-gradient-to-r from-accent-purple to-pink-500 text-white'
        }`}>
          {type === 'movie' ? 'Movie' : 'TV Show'}
        </span>

        {/* Rating Bubble */}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-mid-bg/90 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md border border-white/5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-slate-100">{parseFloat(item.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Bookmark Trigger Button */}
        <button
          onClick={toggleBookmark}
          aria-label="Bookmark item"
          className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-accent-blue/20 backdrop-blur-md border border-white/10 group/btn transition-all duration-200"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-accent-blue fill-accent-blue" />
          ) : (
            <Bookmark className="w-4 h-4 text-white group-hover/btn:text-accent-blue transition-colors" />
          )}
        </button>
      </div>

      {/* Info labels */}
      <div className="mt-3 flex flex-col justify-between flex-1">
        <h3 className="text-display font-medium text-sm text-white line-clamp-1 group-hover:text-accent-blue transition-colors leading-tight">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
          <span>{item.year}</span>
          <span className="line-clamp-1 max-w-[60%] text-right font-light truncate">
            {item.genre ? item.genre.split(',')[0] : 'Media'}
          </span>
        </div>
      </div>
    </Link>
  );
}
