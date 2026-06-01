/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, MouseEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History as HistoryIcon, Play, Trash2, ArrowRight, Film, Tv, PlaySquare } from 'lucide-react';
import { WatchHistoryItem } from '../types';

export function History() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const navigate = useNavigate();

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('sv_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistoryItem = (e: MouseEvent, itemId: string, season?: string, episode?: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const updated = history.filter(item => {
        if (item.id === itemId) {
          if (item.type === 'tv') {
            return !(item.season === season && item.episode === episode);
          }
          return false;
        }
        return true;
      });

      localStorage.setItem('sv_history', JSON.stringify(updated));
      setHistory(updated);

      // Wipe progress marker as well
      if (season && episode) {
        localStorage.removeItem(`sv_progress_tv_${itemId}_s${season}_e${episode}`);
      } else {
        localStorage.removeItem(`sv_progress_${itemId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Do you want to reset all watch history? This will clear all local tracking progress bars.")) {
      // Clear progress keys manually
      history.forEach(item => {
        if (item.type === 'tv' && item.season && item.episode) {
          localStorage.removeItem(`sv_progress_tv_${item.id}_s${item.season}_e${item.episode}`);
        } else {
          localStorage.removeItem(`sv_progress_${item.id}`);
        }
      });
      localStorage.removeItem('sv_history');
      setHistory([]);
    }
  };

  const formatProgressTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div id="history-page-root" className="min-h-screen bg-mid-bg text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header content and block controllers */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center border border-accent-purple/20">
              <HistoryIcon className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <h1 className="text-display text-2xl sm:text-3xl font-bold tracking-tight">Viewing History</h1>
              <p className="text-xs text-slate-400 font-light mt-0.5">Resume blockbuster captures exactly where you left off</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="text-xs bg-white/5 hover:bg-white/10 text-pink-400 hover:text-pink-300 border border-white/10 px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All History
            </button>
          )}
        </div>

        {/* History Stream */}
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, index) => {
              const hasProgress = item.duration > 0 && item.progress > 0;
              const percentage = hasProgress ? (item.progress / item.duration) * 100 : 0;
              
              // Decide resume targets
              const resumeUrl = item.type === 'movie'
                ? `/watch/movie/${item.id}`
                : `/watch/tv/${item.id}?season=${item.season || '1'}&episode=${item.episode || '1'}`;

              return (
                <div
                  key={`${item.id}-${item.season}-${item.episode}-${index}`}
                  className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap hover:border-accent-blue/20 transition-all group"
                >
                  
                  {/* Poster Thumbnail detail layout */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 sm:w-14 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 select-none border border-white/5">
                      <img
                        src={item.poster_url || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=100"}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-slate-100 truncate line-clamp-1">
                          {item.title}
                        </h2>
                        {item.type === 'tv' && (
                          <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded border border-accent-purple/15">
                            S{item.season} E{item.episode}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono">
                          {item.type === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                      </div>

                      <div className="space-y-1 max-w-md">
                        {/* Progress time label */}
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>
                            {hasProgress ? `Watched: ${formatProgressTime(item.progress)}` : 'Playback initiated'}
                          </span>
                          {hasProgress && (
                            <span>
                              {Math.floor(percentage)}% of {formatProgressTime(item.duration)}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar background slide */}
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ${
                              item.type === 'movie'
                                ? 'from-accent-blue to-blue-500'
                                : 'from-accent-purple to-pink-500'
                            }`}
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
                    <button
                      onClick={(e) => handleClearHistoryItem(e, item.id, item.season, item.episode)}
                      className="p-2 text-slate-500 hover:text-pink-400 hover:bg-pink-500/5 rounded-lg transition-colors cursor-pointer"
                      title="Delete log item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={resumeUrl}
                      className="flex items-center gap-1.5 bg-white/5 group-hover:bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-white/10 group-hover:border-accent-blue/30 px-4 py-2 rounded-xl text-xs font-semibold text-accent-blue hover:text-white transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Resume
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-white/5 space-y-4 p-6">
            <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-300 font-bold text-sm">No Viewing History.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Films or TV episodes you stream will display progressive bars here, allowing seamless resume hooks.</p>
            </div>
            <Link
              to="/"
              className="text-xs bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20 hover:text-white px-5 py-2 rounded-full transition inline-block cursor-pointer font-medium"
            >
              Browse Catalog Mirror
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
