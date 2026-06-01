/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, SlidersHorizontal, Trash2, Search } from 'lucide-react';

interface FilterBarProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  availableGenres: string[];
  availableYears: string[];
  onReset: () => void;
  // Optional search & sort features to refine catalog
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
}

export function FilterBar({
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  selectedRating,
  onRatingChange,
  availableGenres,
  availableYears,
  onReset,
  searchQuery,
  onSearchQueryChange,
  selectedSort,
  onSortChange
}: FilterBarProps) {
  // Set default genres just in case the dynamic parsing is incomplete on loading
  const genres = availableGenres.length > 0
    ? ['All', ...availableGenres]
    : ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Adventure', 'Fantasy', 'Mystery'];

  const years = ['All', ...availableYears.sort((a, b) => b.localeCompare(a))];
  const ratings = [
    { value: 'All', label: 'All Ratings' },
    { value: '8.5', label: '8.5+ Stellar Rating' },
    { value: '8.0', label: '8.0+ Highly Rated' },
    { value: '7.0', label: '7.0+ Recommended' },
    { value: '6.0', label: '6.0+ Above Average' },
  ];

  const hasActiveFilters = 
    selectedGenre !== 'All' || 
    selectedYear !== 'All' || 
    selectedRating !== 'All' || 
    (searchQuery && searchQuery !== '') || 
    (selectedSort && selectedSort !== 'popular');

  return (
    <div id="filter-bar-container" className="glass p-5 rounded-2xl border border-white/5 shadow-xl space-y-4">
      
      {/* Top Filter Header and Reset Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-slate-200">
          <SlidersHorizontal className="w-4 h-4 text-accent-blue" />
          <span className="text-display font-semibold text-sm tracking-wide">Refine Catalog</span>
        </div>
        
        {/* Reset Trigger */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-medium text-pink-400 hover:text-pink-300 flex items-center gap-1 active:scale-95 transition-all self-end"
          >
            <Trash2 className="w-3 h-3" />
            Reset Custom Filters
          </button>
        )}
      </div>

      {/* Genre Pills Row */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Filter by Genre</label>
        <div className="flex items-center gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                (genre === 'All' && selectedGenre === 'All') || (selectedGenre.toLowerCase() === genre.toLowerCase())
                  ? 'gradient-pill-active font-medium'
                  : 'gradient-pill'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Filters Form layout */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${onSearchQueryChange && onSortChange ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4 pt-1`}>
        
        {/* Inline Search inside the repository pages */}
        {onSearchQueryChange && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="inline-search" className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Search Catalog</label>
            <div className="relative">
              <input
                id="inline-search"
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Title, genre, or star..."
                className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 pl-9 pr-8 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 backdrop-blur-md transition-all placeholder:text-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {(searchQuery && searchQuery !== '') && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer focus:outline-none"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Release Year Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="year-select" className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Release Year</label>
          <div className="relative">
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 backdrop-blur-md cursor-pointer transition-all"
            >
              {years.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-950 text-slate-100">
                  {yr === 'All' ? 'All Release Years' : yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rating threshold select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rating-select" className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">IMDb Rating</label>
          <div className="relative">
            <select
              id="rating-select"
              value={selectedRating}
              onChange={(e) => onRatingChange(e.target.value)}
              className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 backdrop-blur-md cursor-pointer transition-all"
            >
              {ratings.map((rate) => (
                <option key={rate.value} value={rate.value} className="bg-slate-950 text-slate-100">
                  {rate.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting Criteria selection */}
        {onSortChange && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sort-select" className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sort By</label>
            <div className="relative">
              <select
                id="sort-select"
                value={selectedSort || 'popular'}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full text-xs bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 backdrop-blur-md cursor-pointer transition-all"
              >
                <option value="popular" className="bg-slate-950 text-slate-100">Most Popular</option>
                <option value="rating-desc" className="bg-slate-950 text-slate-100">Top Rated (High-Low)</option>
                <option value="year-desc" className="bg-slate-950 text-slate-100">Newest Releases</option>
                <option value="year-asc" className="bg-slate-950 text-slate-100">Oldest Releases</option>
                <option value="title-asc" className="bg-slate-950 text-slate-100">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
