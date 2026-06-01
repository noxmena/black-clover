/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVShows } from './pages/TVShows';
import { Search } from './pages/Search';
import { ShowDetail } from './pages/ShowDetail';
import { WatchMovie } from './pages/WatchMovie';
import { WatchTV } from './pages/WatchTV';
import { Watchlist } from './pages/Watchlist';
import { History } from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mid-bg font-sans selection:bg-accent-blue/30 selection:text-white flex flex-col">
        {/* Sticky Global Navigation */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/search" element={<Search />} />
            <Route path="/detail/:type/:id" element={<ShowDetail />} />
            <Route path="/watch/movie/:id" element={<WatchMovie />} />
            <Route path="/watch/tv/:id" element={<WatchTV />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/history" element={<History />} />
            {/* Catch-all Redirect is root */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="glass border-t border-white/5 py-8 text-center text-xs text-slate-500 z-10 space-y-1.5 mt-8 bg-[#03060c]">
          <p>© 2026 StreamVault Inc. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-[11px] text-slate-600">
            <span>Ad-Blocking Sandbox Mode Active</span>
            <span>•</span>
            <span>Subtitle OS Finders Integrated</span>
            <span>•</span>
            <span>Fallback Resilience Active</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
