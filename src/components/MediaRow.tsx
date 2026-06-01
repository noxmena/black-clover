/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRowProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function MediaRow({ id, title, subtitle, children }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Trigger check initially & handle resize
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div id={`media-row-container-${id}`} className="relative group/row my-8 px-4 sm:px-6 lg:px-8">
      
      {/* Row Header Info */}
      <div className="flex flex-col mb-4">
        <h2 className="text-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue inline-block animate-pulse" />
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 font-light mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Slide Runway */}
      <div className="relative">
        
        {/* Left Arrow (Fades in on Row Hover IF scrolled) */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-30 p-2 rounded-full glass hover:bg-accent-blue/20 border border-white/10 hover:border-accent-blue/30 text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 transform scale-90 group-hover/row:scale-100 cursor-pointer hidden sm:flex items-center justify-center hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Horizontal Scroll Element Wrapper */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-1 px-1 scroll-smooth no-scrollbar scrollbar-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {children}
        </div>

        {/* Right Arrow (Fades in on Row Hover IF more items exist) */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-30 p-2 rounded-full glass hover:bg-accent-blue/20 border border-white/10 hover:border-accent-blue/30 text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 transform scale-90 group-hover/row:scale-100 cursor-pointer hidden sm:flex items-center justify-center hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
}
