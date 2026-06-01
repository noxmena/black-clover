/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Movie, TVShow } from '../types';

interface HeroBannerProps {
  items: (Movie | TVShow)[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [watchlistStatus, setWatchlistStatus] = useState<{ [key: string]: boolean }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Settle watchlist status for all rotating items
    try {
      const stored = localStorage.getItem('sv_watchlist');
      if (stored) {
        const list = JSON.parse(stored);
        const statusMap: { [key: string]: boolean } = {};
        items.forEach(item => {
          const id = item.tmdb_id || item.imdb_id;
          statusMap[id] = list.some((elem: any) => elem.id === id);
        });
        setWatchlistStatus(statusMap);
      }
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  // Handle auto-rotate interval every 6s
  useEffect(() => {
    if (items.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items, currentIndex]);

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleToggleWatchlist = (item: Movie | TVShow, e: MouseEvent) => {
    e.preventDefault();
    const id = item.tmdb_id || item.imdb_id;
    try {
      const stored = localStorage.getItem('sv_watchlist') || '[]';
      let list = JSON.parse(stored);
      const exists = list.some((elem: any) => elem.id === id);

      if (exists) {
        list = list.filter((elem: any) => elem.id !== id);
        setWatchlistStatus(prev => ({ ...prev, [id]: false }));
      } else {
        list.push({
          id,
          title: item.title,
          poster_url: item.poster_url,
          rating: item.rating,
          year: item.year,
          type: item.type,
          genre: item.genre,
          addedAt: Date.now()
        });
        setWatchlistStatus(prev => ({ ...prev, [id]: true }));
      }
      localStorage.setItem('sv_watchlist', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center bg-mid-bg border-b border-white/5 animate-pulse">
        <div className="text-slate-500 font-display text-lg">Preparing Spotlight Content...</div>
      </div>
    );
  }

  const activeItem = items[currentIndex];
  const activeId = activeItem.tmdb_id || activeItem.imdb_id;

  return (
    <div className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-[#02070e] border-b border-blue-500/10">
      
      {/* Background Poster Cover Image with Multi-directional Gradients */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out scale-100">
        <img
          src={activeItem.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600"}
          alt={activeItem.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 object-center scale-105 filter blur-[1px] md:blur-0 transition-opacity"
        />
        {/* Left deep-shadow fade to absolute black */}
        <div className="absolute inset-0 hero-gradient" />
        {/* Bottom deep fade to black-navy */}
        <div className="absolute inset-0 hero-bottom-gradient" />
      </div>

      {/* Slide Content Frame */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-8">
          
          <div className="md:col-span-8 flex flex-col items-start gap-4 text-left">
            
            {/* Tag / Genre list */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-mid-bg tracking-widest bg-gradient-to-r from-accent-blue to-accent-purple px-2.5 py-1 rounded-sm uppercase shadow-lg shadow-blue-500/10">
                Spotlight
              </span>
              <span className="text-xs text-slate-300 font-medium">•</span>
              <span className="text-xs text-slate-400 font-mono tracking-wider">{activeItem.genre}</span>
            </div>

            {/* Title Display */}
            <h1 className="text-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-2xl select-none">
              {activeItem.title}
            </h1>

            {/* Quick Metadata Info Bar */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold text-white">HD</span>
              <span>{activeItem.year}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{parseFloat(activeItem.rating).toFixed(1)}</span>
                <span className="text-slate-400 font-light">/10</span>
              </div>
              <span>•</span>
              <span className="text-accent-blue font-semibold uppercase text-[10px] tracking-wider bg-accent-blue/10 px-2 py-0.5 rounded">
                {activeItem.type === 'movie' ? 'Movie' : 'TV Series'}
              </span>
            </div>

            {/* Pitch Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Experience the latest premium blockbuster production exclusively on StreamVault. Stream immediately with complete ad-blocking and automatic episode synchronization.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 mt-2 flex-wrap">
              <Link
                to={`/detail/${activeItem.type}/${activeId}`}
                className="flex items-center gap-2 bg-gradient-to-r from-accent-blue to-accent-purple text-mid-bg font-display font-medium text-sm px-6 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all text-white border border-blue-400/20"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                Play Content
              </Link>

              <button
                onClick={(e) => handleToggleWatchlist(activeItem, e)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-medium text-sm px-5 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              >
                {watchlistStatus[activeId] ? (
                  <>
                    <Check className="w-4 h-4 text-accent-blue" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Watchlist
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Sizable Visual Poster Column (Hidden on Small Screens) */}
          <div className="hidden md:col-span-4 md:flex justify-end select-none">
            <div className="w-64 aspect-[2/3] rounded-2xl overflow-hidden glass border-2 border-white/10 hover:border-accent-blue/30 shadow-2xl transition-all duration-500 hover:scale-102">
              <img
                src={activeItem.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Manual Arrow Triggers */}
      <button
        onClick={handlePrev}
        aria-label="Previous Spotlight Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass hover:bg-accent-blue/20 border border-white/10 hover:border-accent-blue/30 text-white cursor-pointer z-20 hover:scale-110 transition-all hidden md:flex items-center justify-center group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:text-accent-blue transition-colors" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Spotlight Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass hover:bg-accent-blue/20 border border-white/10 hover:border-accent-blue/30 text-white cursor-pointer z-20 hover:scale-110 transition-all hidden md:flex items-center justify-center group"
      >
        <ChevronRight className="w-5 h-5 group-hover:text-accent-blue transition-colors" />
      </button>

      {/* Bottom Floating Interactive Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setCurrentIndex(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-accent-blue to-accent-purple'
                : 'w-2.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

    </div>
  );
}
