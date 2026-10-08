import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Compass, Layers, Check } from 'lucide-react';
import { ChevronsUpDownIcon } from '../ui/ChevronsUpDownIcon';
import { useTheme } from '../../context/ThemeContext';

export default function ScrollNavigationWidget() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTools, setShowScrollTools] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const iconRef = useRef(null);

  // Helper to get active scroll element
  const getScrollContainer = () => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer && mainContainer.scrollHeight > mainContainer.clientHeight + 50) {
      return mainContainer;
    }
    return document.documentElement || document.body;
  };

  const handleScroll = () => {
    const container = getScrollContainer();
    const isWindow = container === document.documentElement || container === document.body;
    
    const scrollTop = isWindow ? window.scrollY : container.scrollTop;
    const scrollHeight = isWindow ? document.documentElement.scrollHeight : container.scrollHeight;
    const clientHeight = isWindow ? window.innerHeight : container.clientHeight;

    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))) : 0;

    setScrollProgress(progress);
    setAtTop(scrollTop < 80);
    setAtBottom(scrollTop >= maxScroll - 80);
    setShowScrollTools(scrollHeight > clientHeight + 150);
  };

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    
    // Initial check
    handleScroll();

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    const timer = setTimeout(handleScroll, 500);

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  const scrollToTop = () => {
    const container = getScrollContainer();
    if (container === document.documentElement || container === document.body) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (iconRef.current?.startAnimation) {
      iconRef.current.startAnimation();
      setTimeout(() => iconRef.current?.stopAnimation(), 600);
    }
  };

  const scrollToBottom = () => {
    const container = getScrollContainer();
    const isWindow = container === document.documentElement || container === document.body;
    const scrollHeight = isWindow ? document.documentElement.scrollHeight : container.scrollHeight;

    if (isWindow) {
      window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    }
    if (iconRef.current?.startAnimation) {
      iconRef.current.startAnimation();
      setTimeout(() => iconRef.current?.stopAnimation(), 600);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (iconRef.current) {
        if (next) iconRef.current.startAnimation();
        else iconRef.current.stopAnimation();
      }
      return next;
    });
  };

  // Do not show floating scroll widget on homepage or when at top
  if (location.pathname === '/' || atTop || (!showScrollTools && scrollProgress === 0)) {
    return null;
  }

  // Calculate SVG Circle Progress
  const strokeDashoffset = 100 - scrollProgress;

  return (
    <aside
      aria-label="Scroll navigation controls"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none print:hidden font-sans"
    >
      {/* Expandable Quick Nav Tray */}
      {isExpanded && (
        <div className="mb-2 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl flex flex-col gap-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <Compass className="w-3.5 h-3.5 text-orange-500" />
              <span>Scroll Controls</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 font-bold">
              {scrollProgress}%
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <button
              onClick={scrollToTop}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <ChevronsUp className="w-3.5 h-3.5 text-orange-500 group-hover:-translate-y-0.5 transition-transform" />
                <span className="font-semibold text-[11px]">Jump to Top</span>
              </span>
              <span className="text-[9px] font-mono text-[var(--text-muted)]">Home / Header</span>
            </button>

            <button
              onClick={scrollToBottom}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <ChevronsDown className="w-3.5 h-3.5 text-amber-500 group-hover:translate-y-0.5 transition-transform" />
                <span className="font-semibold text-[11px]">Jump to Bottom</span>
              </span>
              <span className="text-[9px] font-mono text-[var(--text-muted)]">Footer / Tools</span>
            </button>
          </div>

          {/* Quick Scroll Progress Bar */}
          <div className="pt-1">
            <div className="w-full h-1.5 bg-[var(--bg-inner)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Main Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
        
        {/* Upward Scroll Button */}
        <button
          onClick={scrollToTop}
          disabled={atTop}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            atTop
              ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
              : 'text-[var(--text-secondary)] hover:text-orange-500 hover:bg-[var(--bg-hover)] active:scale-95'
          }`}
          title="Scroll Upward (To Top)"
          aria-label="Scroll Upward"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Central Animated Chevrons Up Down Toggle Button */}
        <button
          onClick={toggleExpanded}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Toggle Upward / Downward Scroll Tools"
          aria-label="Toggle Upward and Downward Scroll Tools"
        >
          {/* Circular Progress Stroke */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 36 36">
            <path
              className="text-white/20"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-white transition-all duration-200"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          {/* Morphing Chevrons Up Down Icon */}
          <ChevronsUpDownIcon
            ref={iconRef}
            open={isExpanded}
            duration={0.25}
            className="w-4.5 h-4.5 z-10"
          />
        </button>

        {/* Downward Scroll Button */}
        <button
          onClick={scrollToBottom}
          disabled={atBottom}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            atBottom
              ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
              : 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[var(--bg-hover)] active:scale-95'
          }`}
          title="Scroll Downward (To Bottom)"
          aria-label="Scroll Downward"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
