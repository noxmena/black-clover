/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Database, Heart, History, Film, Tv } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const navigate = useRef(useNavigate()).current;
  const location = useLocation();

  // Handle transparent to glass transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchronize searchQuery with search URL parameters if they exist
  useEffect(() => {
    if (location.pathname === '/search') {
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q');
      if (query) {
        setSearchQuery(query);
      }
    } else {
      setSearchQuery('');
    }
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass py-3 border-b border-blue-500/10 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Database className="w-5 h-5 text-mid-bg fill-current" />
            </div>
            <span className="text-display font-bold text-xl tracking-wider text-white select-none">
              Stream<span className="text-accent-blue bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">Vault</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors duration-200 ${
                isActive('/') ? 'text-accent-blue' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isActive('/movies') ? 'text-accent-blue' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              Movies
            </Link>
            <Link
              to="/tv-shows"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isActive('/tv-shows') ? 'text-accent-blue' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              TV Shows
            </Link>
            <Link
              to="/watchlist"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isActive('/watchlist') ? 'text-accent-blue' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              Watchlist
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isActive('/history') ? 'text-accent-blue' : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </div>

          {/* Search Input Bar & Mobile Launcher Toggle */}
          <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-sm justify-end ml-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fuzzy search titles, genres..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 backdrop-blur-md transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent-blue transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass border-b border-blue-500/10 shadow-2xl py-4 px-6 flex flex-col gap-4 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold py-2 border-b border-white/5 ${
              isActive('/') ? 'text-accent-blue' : 'text-slate-300'
            }`}
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold py-2 border-b border-white/5 flex items-center gap-2 ${
              isActive('/movies') ? 'text-accent-blue' : 'text-slate-300'
            }`}
          >
            <Film className="w-4 h-4 text-accent-blue" />
            Movies
          </Link>
          <Link
            to="/tv-shows"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold py-2 border-b border-white/5 flex items-center gap-2 ${
              isActive('/tv-shows') ? 'text-accent-blue' : 'text-slate-300'
            }`}
          >
            <Tv className="w-4 h-4 text-accent-purple" />
            TV Shows
          </Link>
          <Link
            to="/watchlist"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold py-2 border-b border-white/5 flex items-center gap-2 ${
              isActive('/watchlist') ? 'text-accent-blue' : 'text-slate-300'
            }`}
          >
            <Heart className="w-4 h-4 text-red-400" />
            Watchlist
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold py-2 flex items-center gap-2 ${
              isActive('/history') ? 'text-accent-blue' : 'text-slate-300'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            History
          </Link>
        </div>
      )}
    </nav>
  );
}
