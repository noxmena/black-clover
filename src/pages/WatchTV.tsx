/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, ShieldAlert, CheckCircle, Volume2, Calendar, Tv, SkipForward, X } from 'lucide-react';
import { getMediaById, fetchAllEpisodes } from '../services/api';
import { TVShow, Episode } from '../types';

export function WatchTV() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse season and episode query parameters: /watch/tv/123?season=1&episode=2
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  const [show, setShow] = useState<TVShow | null>(null);
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [playerDuration, setPlayerDuration] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Buffering episode streams...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeServer, setActiveServer] = useState<string>(() => {
    return localStorage.getItem('sv_streaming_server') || 'vaplayer';
  });

  const handleServerChange = (serverId: string) => {
    setActiveServer(serverId);
    localStorage.setItem('sv_streaming_server', serverId);
  };

  // Auto-next Countdown states
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load parent show information and episodes
  useEffect(() => {
    let active = true;

    async function loadTVDetails() {
      if (!id) return;
      try {
        setIsLoading(true);
        const [foundShow, allEp] = await Promise.all([
          getMediaById('tv', id),
          fetchAllEpisodes()
        ]);
        const matchedEp = allEp.filter(ep => ep.show_tmdb_id === id || ep.show_imdb_id === id);

        if (active) {
          let showItem: TVShow | null = null;
          if (foundShow && foundShow.type === 'tv') {
            showItem = foundShow as TVShow;
            setShow(showItem);
          }
          setEpisodesList(matchedEp);

          // Locate local progress resumeAt marker
          // Key format standard: tv_[id]_[season]_[episode]
          const progressKey = `sv_progress_tv_${id}_s${season}_e${episode}`;
          const savedStr = localStorage.getItem(progressKey);
          if (savedStr) {
            const savedTime = parseFloat(savedStr);
            if (savedTime > 5) {
              setSavedProgress(savedTime);
              setStatusMessage(`Auto-resuming progress at ${Math.floor(savedTime / 60)}m ${Math.floor(savedTime % 60)}s`);
            } else {
              setSavedProgress(0);
            }
          } else {
            setSavedProgress(0);
          }

          // Reset any dangling countdown timer
          clearCountdown();

          // Log TV history entry
          if (showItem) {
            logHistory(showItem, season, episode, 0, 0);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadTVDetails();

    return () => {
      active = false;
      clearCountdown();
    };
  }, [id, season, episode]);

  // Log television series progress trace in sv_history
  const logHistory = (showMedia: TVShow, sNum: string, eNum: string, progress: number, duration: number) => {
    try {
      const stored = localStorage.getItem('sv_history') || '[]';
      let historyList = JSON.parse(stored);

      const itemId = showMedia.tmdb_id || showMedia.imdb_id;
      // Filter out duplicate episode watches of the same show
      historyList = historyList.filter((item: any) => !(item.id === itemId && item.season === sNum && item.episode === eNum));

      historyList.unshift({
        id: itemId,
        title: showMedia.title,
        poster_url: showMedia.poster_url,
        type: 'tv',
        lastWatchedAt: Date.now(),
        progress,
        duration,
        season: sNum,
        episode: eNum
      });

      localStorage.setItem('sv_history', JSON.stringify(historyList.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  };

  // Safe countdown cancellers
  const clearCountdown = () => {
    setCountdown(null);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Trigger Auto-Next Countdown Frame
  const triggerAutoNextCountdown = () => {
    clearCountdown();
    setCountdown(10);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Timer finished! Load next episode
          clearCountdown();
          loadNextEpisode();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const loadNextEpisode = () => {
    const nextEpNum = String(parseInt(episode) + 1);
    setStatusMessage(`Triggering autoplay: redirecting to Season ${season} Episode ${nextEpNum}...`);
    setSearchParams({ season, episode: nextEpNum });
  };

  const handleSelectItem = (targetSeason: string, targetEpisode: string) => {
    clearCountdown();
    setSearchParams({ season: targetSeason, episode: targetEpisode });
  };

  // Listener for payer postMessages
  useEffect(() => {
    const handlePlayerMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PLAYER_EVENT') {
        const { player_status, player_progress, player_duration } = e.data.data;
        const currentProgress = parseFloat(player_progress || '0');
        const totalDuration = parseFloat(player_duration || '0');

        if (player_status === 'playing' || player_status === 'seeked') {
          setPlayerProgress(currentProgress);
          setPlayerDuration(totalDuration);
          setStatusMessage(`Streaming media session online...`);

          if (id) {
            // Save state progress
            const progressKey = `sv_progress_tv_${id}_s${season}_e${episode}`;
            localStorage.setItem(progressKey, String(currentProgress));

            if (show) {
              logHistory(show, season, episode, currentProgress, totalDuration);
            }
          }
        } else if (player_status === 'completed') {
          setStatusMessage(`Session completed.`);
          const progressKey = `sv_progress_tv_${id}_s${season}_e${episode}`;
          localStorage.removeItem(progressKey);

          // Initiate Countdown to autoplay next episode!
          triggerAutoNextCountdown();
        } else if (player_status === 'paused') {
          setStatusMessage(`Playback paused.`);
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => {
      window.removeEventListener('message', handlePlayerMessage);
    };
  }, [id, season, episode, show]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mid-bg flex flex-col items-center justify-center gap-2">
        <Tv className="w-10 h-10 text-accent-purple animate-pulse" />
        <span className="text-xs text-slate-400">Loading Episodes Streaming Deck...</span>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-mid-bg flex flex-col items-center justify-center p-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-white text-lg font-bold">Failed to load television media</h2>
        <button onClick={() => navigate(-1)} className="text-xs text-accent-blue hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Group real-time downloaded episodes or build falling back sets for responsive view
  const seasonsMap: { [key: string]: Episode[] } = {};
  episodesList.forEach(ep => {
    const sNum = ep.season_number;
    if (!seasonsMap[sNum]) seasonsMap[sNum] = [];
    seasonsMap[sNum].push(ep);
  });

  const availableSeasons = Object.keys(seasonsMap).length > 0
    ? Object.keys(seasonsMap).sort((a,b) => parseInt(a) - parseInt(b))
    : ['1', '2'];

  const getEpisodesForActiveSeason = () => {
    if (seasonsMap[season]) {
      return seasonsMap[season];
    }
    // Static fallback list if no episode arrays loaded
    return Array.from({ length: 8 }).map((_, i) => ({
      show_tmdb_id: id || '',
      show_imdb_id: show.imdb_id || '',
      season_number: season,
      episode_number: String(i + 1),
      episode_title: `Episode ${i + 1} - Cinematic Prelude`,
      air_date: `${show.year}-04-${String(10 + i)}`,
      show_title: show.title,
      type: 'episode' as const,
      embed_url: `https://vaplayer.ru/embed/tv/${show.imdb_id || id}/${season}/${i+1}`
    }));
  };

  const activeEpisodes = getEpisodesForActiveSeason();

  // Embed url construction
  let playerEmbedUrl = `https://vaplayer.ru/embed/tv/${show.imdb_id || id}/${season}/${episode}?primaryColor=%23A855F7&autoplay=1&lang=en&sub_default=true${
    savedProgress > 5 ? `&resumeAt=${savedProgress}` : ''
  }`;

  if (activeServer === 'streamimdb') {
    playerEmbedUrl = `https://streamimdb.ru/embed/tv/${show.imdb_id || id}/${season}/${episode}`;
  } else if (activeServer === 'vidsrc') {
    playerEmbedUrl = `https://vidsrc.to/embed/tv/${show.imdb_id || id}/${season}/${episode}`;
  } else if (activeServer === 'superembed') {
    playerEmbedUrl = `https://multiembed.eu/?video_id=${show.imdb_id || id}&s=${season}&e=${episode}`;
  }

  const progressPercentage = playerDuration > 0 ? (playerProgress / playerDuration) * 100 : 0;

  return (
    <div id="watch-tv-root" className="min-h-screen bg-[#02050b] flex flex-col pt-16 relative">
      
      {/* Immersive Top Control Bar */}
      <div className="glass p-3 border-b border-white/5 flex items-center justify-between px-6 z-15">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/detail/tv/${id}`)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Detail Deck
          </button>
          
          <div>
            <h1 className="text-sm font-bold text-white tracking-widest">{show.title}</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              Season {season} • Episode {episode} • {show.genre.split(',')[0]}
            </p>
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
          <div className="flex items-center gap-2 text-[10px] text-accent-purple bg-purple-950/40 border border-purple-800/35 px-4 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-accent-purple" />
            <span className="font-semibold uppercase tracking-wider hidden sm:inline">No Advertisement Mirror Secure</span>
            <span className="font-semibold uppercase tracking-wider sm:hidden">Armed</span>
          </div>
        </div>
      </div>

      {/* Embedded Theater with Grid column underneath for scrolling episodes */}
      <div className="flex-1 w-full bg-black min-h-[45vh] flex flex-col md:flex-row relative">
        
        {/* Ad-blocked Sandbox Iframe Player */}
        <div className="flex-1 relative aspect-video md:aspect-auto">
          <iframe
            id="streaming-iframe"
            src={playerEmbedUrl}
            title={`${show.title} S0${season}E0${episode}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            referrerPolicy="no-referrer"
            allowFullScreen
            className="w-full h-full absolute inset-0 bg-black border-none"
          />

          {/* Autoplay Next countdown banner overlay */}
          {countdown !== null && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-sm glass-card border border-accent-purple/30 p-5 rounded-2xl text-center shadow-2xl space-y-4 animate-scaleUp z-20">
              <SkipForward className="w-10 h-10 text-accent-purple animate-bounce mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-sm">Autoplay triggering in {countdown}s</h3>
                <p className="text-[11px] text-slate-400 font-light">Loading Season {season} Episode {parseInt(episode) + 1}</p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={loadNextEpisode}
                  className="bg-accent-purple hover:bg-purple-600 text-white rounded-full text-xs font-semibold px-4 py-1.5 transition-colors cursor-pointer"
                >
                  Skip Countdown
                </button>
                <button
                  onClick={clearCountdown}
                  className="bg-white/5 hover:bg-white/10 px-4 py-1.5 border border-white/10 text-slate-300 hover:text-white rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sidebar Episode Navigator (Right pane) */}
        <div className="w-full md:w-80 glass border-t md:border-t-0 md:border-l border-white/5 p-4 flex flex-col overflow-y-auto max-h-[40vh] md:max-h-none z-10 bg-[#040810]/70">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
            <span className="text-xs font-bold text-slate-300 tracking-wider font-display uppercase">Episode Selector</span>
            <span className="text-[10px] text-accent-purple font-mono">Season {season}</span>
          </div>

          <div className="space-y-2 flex-grow overflow-y-auto pr-1">
            {activeEpisodes.map((ep) => {
              const isActive = ep.episode_number === episode;
              return (
                <button
                  key={`${ep.season_number}-${ep.episode_number}`}
                  onClick={() => handleSelectItem(season, ep.episode_number)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex gap-3 items-center cursor-pointer ${
                    isActive
                      ? 'bg-accent-purple/10 border-accent-purple/50 text-white shadow-md'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/8 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center font-mono font-bold text-[10px] ${
                    isActive ? 'bg-accent-purple text-white' : 'bg-slate-900 border border-white/5 text-slate-400'
                  }`}>
                    {ep.episode_number}
                  </div>
                  <div className="truncate flex-1">
                    <p className={`font-semibold truncate ${isActive ? 'text-accent-purple' : 'text-slate-100'}`}>
                      {ep.episode_title}
                    </p>
                    {ep.air_date && <span className="text-[9px] text-slate-500 font-light block">{ep.air_date}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick skip trigger next bottom row */}
          <div className="border-t border-white/5 pt-3 mt-3 flex justify-end">
            <button
              onClick={loadNextEpisode}
              className="text-[11px] text-slate-300 hover:text-accent-purple flex items-center gap-1 transition-colors cursor-pointer"
            >
              Skip to Next
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Bottom status deck bar */}
      <div className="glass px-6 py-4 border-t border-white/5 space-y-3 z-10 bg-slate-950/70">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-accent-purple" />
            {statusMessage}
          </span>

          {playerDuration > 0 && (
            <span className="text-slate-400 font-mono font-medium">
              {Math.floor(playerProgress / 60)}s / {Math.floor(playerDuration / 60)}s (
              {Math.floor(progressPercentage)}%)
            </span>
          )}
        </div>

        {/* Sync Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-purple to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Subtitle details helpful tips */}
        <div className="text-[10px] text-slate-500 font-light flex justify-between items-center pt-1 border-t border-white/5">
          <span>Tip: Automatic next episodic transitions timer triggers when episode finishes playing.</span>
          <span>Security Sandbox Active</span>
        </div>

      </div>

    </div>
  );
}
