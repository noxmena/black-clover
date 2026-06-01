/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ShieldAlert, CheckCircle, RotateCcw, Volume2, Film } from 'lucide-react';
import { getMediaById } from '../services/api';
import { Movie } from '../types';

export function WatchMovie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [playerDuration, setPlayerDuration] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing ad-blocked stream buffer...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeServer, setActiveServer] = useState<string>(() => {
    return localStorage.getItem('sv_streaming_server') || 'vaplayer';
  });

  const handleServerChange = (serverId: string) => {
    setActiveServer(serverId);
    localStorage.setItem('sv_streaming_server', serverId);
  };

  // Load movie metadata and check resume position
  useEffect(() => {
    let active = true;

    async function loadMovie() {
      if (!id) return;
      try {
        const found = await getMediaById('movie', id);
        
        if (active && found && found.type === 'movie') {
          const movieItem = found as Movie;
          setMovie(movieItem);
          
          // Check progress in localStorage
          const savedStr = localStorage.getItem(`sv_progress_${id}`);
          if (savedStr) {
            const savedTime = parseFloat(savedStr);
            if (savedTime > 5) {
              setSavedProgress(savedTime);
              setStatusMessage(`Saved progress found: auto-resuming from ${Math.floor(savedTime / 60)}m ${Math.floor(savedTime % 60)}s`);
            }
          }
          
          // Add basic blank history item on start
          logHistory(movieItem, 0, 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadMovie();

    return () => {
      active = false;
    };
  }, [id]);

  // Log session progress into sv_history
  const logHistory = (media: Movie, progress: number, duration: number) => {
    try {
      const stored = localStorage.getItem('sv_history') || '[]';
      let historyList = JSON.parse(stored);
      
      const itemId = media.tmdb_id || media.imdb_id;
      // Filter out existing to put at top of stack
      historyList = historyList.filter((item: any) => item.id !== itemId);
      
      historyList.unshift({
        id: itemId,
        title: media.title,
        poster_url: media.poster_url,
        type: 'movie',
        lastWatchedAt: Date.now(),
        progress,
        duration
      });

      // Keep maximum 30 items
      localStorage.setItem('sv_history', JSON.stringify(historyList.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  };

  // Manage iframe event postMessage protocol listener
  useEffect(() => {
    const handlePlayerMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PLAYER_EVENT') {
        const { player_status, player_progress, player_duration } = e.data.data;
        const currentProgress = parseFloat(player_progress || '0');
        const totalDuration = parseFloat(player_duration || '0');

        if (player_status === 'playing' || player_status === 'seeked') {
          setPlayerProgress(currentProgress);
          setPlayerDuration(totalDuration);
          setStatusMessage(`Streaming playing smoothly...`);

          // Periodically save progress & log history
          if (id) {
            localStorage.setItem(`sv_progress_${id}`, String(currentProgress));
            if (movie) {
              logHistory(movie, currentProgress, totalDuration);
            }
          }
        } else if (player_status === 'paused') {
          setStatusMessage(`Playback paused.`);
        } else if (player_status === 'completed') {
          setStatusMessage(`Feature presentation completed.`);
          if (id) {
            localStorage.removeItem(`sv_progress_${id}`);
          }
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [id, movie]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mid-bg flex flex-col items-center justify-center gap-2">
        <Film className="w-10 h-10 text-accent-blue animate-pulse" />
        <span className="text-xs text-slate-400">Loading Streaming Portal...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-mid-bg flex flex-col items-center justify-center p-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-white text-lg font-bold">Failed to load movie media</h2>
        <button onClick={() => navigate(-1)} className="text-xs text-accent-blue hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const movieSelectorId = movie.imdb_id || movie.tmdb_id;

  // Construct player embed based on selected server
  let playerEmbedUrl = `https://vaplayer.ru/embed/movie/${movieSelectorId}?primaryColor=%236C9EFF&autoplay=1&lang=en&sub_default=true${
    savedProgress > 5 ? `&resumeAt=${savedProgress}` : ''
  }`;

  if (activeServer === 'streamimdb') {
    playerEmbedUrl = `https://streamimdb.ru/embed/movie/${movieSelectorId}`;
  } else if (activeServer === 'vidsrc') {
    playerEmbedUrl = `https://vidsrc.to/embed/movie/${movieSelectorId}`;
  } else if (activeServer === 'superembed') {
    playerEmbedUrl = `https://multiembed.eu/?video_id=${movieSelectorId}`;
  }

  const progressPercentage = playerDuration > 0 ? (playerProgress / playerDuration) * 100 : 0;

  return (
    <div id="watch-movie-root" className="min-h-screen bg-[#02050b] flex flex-col pt-16">
      
      {/* Immersive Top Control Bar */}
      <div className="glass p-3 border-b border-white/5 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/detail/movie/${id}`)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Detail Deck
          </button>
          
          <div>
            <h1 className="text-sm font-bold text-white tracking-widest">{movie.title}</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider"> थिएटर मोड • {movie.year} • {movie.genre.split(',')[0]} </p>
          </div>
        </div>

        {/* Server & Ad Protection Layout */}
        <div className="flex items-center gap-3">
          {/* Server Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Server:</span>
            <select
              value={activeServer}
              onChange={(e) => handleServerChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer border-none font-semibold pr-1 font-sans"
            >
              <option value="vaplayer" className="bg-[#02050b] text-white">VAPlayer (Primary)</option>
              <option value="streamimdb" className="bg-[#02050b] text-white font-mono">StreamIMDb</option>
              <option value="vidsrc" className="bg-[#02050b] text-white font-mono">VidSrc.to</option>
              <option value="superembed" className="bg-[#02050b] text-white font-mono">SuperEmbed</option>
            </select>
          </div>

          {/* Protection Banner Indicators */}
          <div className="flex items-center gap-2 text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/35 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider hidden sm:inline">Ad-Shield Armed</span>
            <span className="font-semibold uppercase tracking-wider sm:hidden">Armed</span>
          </div>
        </div>
      </div>

      {/* Embedded Theater Container */}
      <div className="relative flex-1 w-full bg-black min-h-[50vh] flex items-center justify-center">
        
        {/* Sandbox is set on the iframe WITHOUT allow-popups and allow-popups-to-escape-sandbox.
            This prevents ANY redirects, new tabs, or popup frames entirely. */}
        <iframe
          id="streaming-iframe"
          src={playerEmbedUrl}
          title={`${movie.title} - StreamVault Theater`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="no-referrer"
          allowFullScreen
          className="w-full h-full absolute inset-0 bg-black border-none"
        />

      </div>

      {/* Status Deck Bar */}
      <div className="glass px-6 py-4 border-t border-white/5 space-y-3 z-10 bg-slate-950/70">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-accent-blue" />
            {statusMessage}
          </span>

          {playerDuration > 0 && (
            <span className="text-slate-400 font-mono font-medium">
              {Math.floor(playerProgress / 60)}m / {Math.floor(playerDuration / 60)}m (
              {Math.floor(progressPercentage)}%)
            </span>
          )}
        </div>

        {/* Sync Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Tips / Options Panel */}
        <div className="text-[10px] text-slate-500 font-light flex justify-between items-center pt-1 border-t border-white/5">
          <span>Tip: Hover in the inner iframe player to toggle audio feeds, quality selectors, or localized text.</span>
          <span>Security Sandbox Enforced</span>
        </div>

      </div>

    </div>
  );
}
