/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Star, Heart, BookmarkCheck, Calendar, ArrowLeft, Hourglass, Film, Tv, ListCollapse } from 'lucide-react';
import { fetchAllEpisodes, getMediaById } from '../services/api';
import { Movie, TVShow, Episode } from '../types';

export function ShowDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Movie | TVShow | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadItemDetails() {
      if (!id || !type) return;
      try {
        setIsLoading(true);
        // Find matching item from either local catalog or online dynamic metadata API
        const foundItem = await getMediaById(type, id) || undefined;

        if (active) {
          if (foundItem) {
            setItem(foundItem);
          } else {
            // Re-route fallback to Home if absolutely missing
            console.warn(`Target media ${id} not found in catalog cache`);
          }
        }

        // Parse matching episodes
        if (type === 'tv') {
          const allEp = await fetchAllEpisodes();
          const matched = allEp.filter(ep => ep.show_tmdb_id === id || ep.show_imdb_id === id);
          if (active) {
            setEpisodes(matched);
          }
        }
      } catch (err) {
        console.error("Failed to load show detail components", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadItemDetails();

    return () => {
      active = false;
    };
  }, [type, id]);

  // Handle Watchlist bookmark status checking
  useEffect(() => {
    if (!id) return;
    try {
      const stored = localStorage.getItem('sv_watchlist');
      if (stored) {
        const watchlist = JSON.parse(stored);
        setIsBookmarked(watchlist.some((elem: any) => elem.id === id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  const toggleBookmark = () => {
    if (!item || !id) return;
    try {
      const stored = localStorage.getItem('sv_watchlist') || '[]';
      let watchlist = JSON.parse(stored);
      const exists = watchlist.some((elem: any) => elem.id === id);

      if (exists) {
        watchlist = watchlist.filter((elem: any) => elem.id !== id);
        setIsBookmarked(false);
      } else {
        watchlist.push({
          id,
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
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mid-bg text-white flex flex-col items-center justify-center gap-4">
        <Hourglass className="w-10 h-10 text-accent-blue animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading block metadata...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-mid-bg text-white flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="p-4 rounded-full bg-red-400/10 border border-red-500/20">
          <Film className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-slate-200 font-semibold text-lg">Detailed record could not be indexed</p>
        <p className="text-xs text-slate-500 max-w-sm">This video might have been deleted from the network. Go back to browse other active items.</p>
        <button
          onClick={() => navigate('/')}
          className="text-xs bg-white/5 border border-white/10 px-5 py-2 hover:bg-white/10 rounded-full transition-all text-accent-blue"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Group TV shows episodes by season or auto-generate fallback seasons if empty
  const seasonsMap: { [key: string]: Episode[] } = {};
  episodes.forEach(ep => {
    const sNum = ep.season_number;
    if (!seasonsMap[sNum]) seasonsMap[sNum] = [];
    seasonsMap[sNum].push(ep);
  });

  const availableSeasons = Object.keys(seasonsMap).length > 0
    ? Object.keys(seasonsMap).sort((a,b) => parseInt(a) - parseInt(b))
    : ['1', '2']; // Fallback options

  // Helper to compile active season episodes listing
  const getActiveEpisodesList = () => {
    if (Object.keys(seasonsMap).length > 0) {
      return seasonsMap[selectedSeason] || [];
    }
    // Dynamic robust mock generation if real TV show episodes list is empty
    return Array.from({ length: 8 }).map((_, i) => ({
      show_tmdb_id: id || '',
      show_imdb_id: item.imdb_id || '',
      season_number: selectedSeason,
      episode_number: String(i + 1),
      episode_title: `Episode ${i + 1} - Cinematic Prelude`,
      air_date: `${item.year}-05-${String(10 + i)}`,
      show_title: item.title,
      type: 'episode' as const,
      embed_url: `https://vaplayer.ru/embed/tv/${item.imdb_id || id}/${selectedSeason}/${i+1}`
    }));
  };

  const activeEpisodes = getActiveEpisodesList();

  return (
    <div id="detail-page-root" className="min-h-screen bg-[#02070e] text-slate-100 pb-20 relative">
      
      {/* Blurred Backdrop Wall */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] overflow-hidden select-none z-0">
        <img
          src={item.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600"}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-20 filter blur-[20px] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02070e] via-[#02070e]/80 to-transparent" />
      </div>

      {/* Main Grid Card layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 relative z-10 space-y-12">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all self-start cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        {/* Cinematic Spotlight overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Cover Poster Frame */}
          <div className="md:col-span-4 flex justify-center select-none">
            <div className="w-56 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden glass-card border-2 border-white/10 shadow-2xl relative">
              <img
                src={item.poster_url || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=60"}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details & Information column */}
          <div className="md:col-span-8 space-y-5 text-left">
            
            {/* Badges row */}
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                item.type === 'movie'
                  ? 'bg-gradient-to-r from-accent-blue to-cyan-500 text-mid-bg'
                  : 'bg-gradient-to-r from-accent-purple to-pink-500 text-white'
              }`}>
                {item.type === 'movie' ? 'Feature Film' : 'TV Show'}
              </span>

              {item.genre && item.genre.split(',').map((g) => (
                <span key={g} className="text-[10px] uppercase font-mono tracking-wider bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">
                  {g.trim()}
                </span>
              ))}
            </div>

            {/* Main Title Display */}
            <h1 className="text-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {item.title}
            </h1>

            {/* Short quick information bars */}
            <div className="flex items-center gap-5 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-extrabold text-white">{parseFloat(item.rating).toFixed(1)}</span>
                <span className="text-slate-500 font-normal">/10</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.year}</span>
              </div>
              <span>•</span>
              <span className="text-slate-400">Dual Audio (En/De)</span>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl font-light">
              Now streaming on StreamVault with zero advertisements, high-fidelity source mirrors, auto-unmute prompts, and localized subtitles. If you stop halfway, your progress is saved locally so you can resume immediately next time.
            </p>

            {/* Inline Action block */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              {item.type === 'movie' ? (
                <Link
                  to={`/watch/movie/${id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-accent-blue to-accent-purple text-mid-bg font-display font-bold text-sm px-8 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all text-white border border-blue-400/20"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  Watch Full HD Movie
                </Link>
              ) : (
                <a
                  href="#episodes-dock"
                  className="flex items-center gap-2 bg-[#A855F7] text-white font-display font-medium text-sm px-6 py-3 rounded-full hover:bg-[#b061fb] hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all border border-purple-400/20"
                >
                  <ListCollapse className="w-4 h-4" />
                  View Season Episodes
                </a>
              )}

              <button
                onClick={toggleBookmark}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-medium text-sm px-5 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-accent-blue" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-white hover:text-red-400 transition-colors" />
                    Bookmark Series
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* EPISODES INDEX AND SEASON NAVIGATION BOX — Only shown for TV shows */}
        {item.type === 'tv' && (
          <div id="episodes-dock" className="space-y-6 pt-8 border-t border-white/5 scroll-mt-24">
            
            {/* Header selection bars and titles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-display font-bold text-lg text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-accent-purple" />
                  Season Episodes Directory
                </h2>
                <p className="text-xs text-slate-400 font-light">Interactive episode tiles with customized subtitle lookups</p>
              </div>

              {/* Season Selection Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {availableSeasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      selectedSeason === season
                        ? 'bg-gradient-to-r from-accent-purple to-pink-500 text-white shadow-lg shadow-purple-500/20 shadow-md border border-purple-400/20'
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    Season {season}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Grid Selector */}
            {activeEpisodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {activeEpisodes.map((ep) => (
                  <Link
                    key={`${ep.season_number}-${ep.episode_number}`}
                    to={`/watch/tv/${id}?season=${ep.season_number}&episode=${ep.episode_number}`}
                    className="group relative bg-[#060c18] border border-white/5 rounded-2xl p-4 flex flex-col justify-between card-hover min-h-32 shadow-xl cursor-pointer select-none"
                  >
                    {/* Top Metadata labels */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded border border-accent-purple/15 font-mono">
                        EPISODE {ep.episode_number}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-accent-purple fill-current text-purple" />
                      </div>
                    </div>

                    {/* Ep details */}
                    <div className="mt-4 space-y-1">
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-accent-purple transition-all">
                        {ep.episode_title}
                      </h3>
                      {ep.air_date && (
                        <div className="text-[9px] text-slate-500">{ep.air_date}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/10 rounded-xl border border-white/5">
                <span className="text-sm font-mono text-slate-500">Retrieving episodes listing...</span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
