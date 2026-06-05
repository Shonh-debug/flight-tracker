'use client';

import { useLanguage } from '@/components/LanguageContext';
import { useState, useEffect } from 'react';

export default function TopBar({
  onMenuToggle,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  loading,
}: {
  onMenuToggle: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }));

      // Build timezone offset string
      const offset = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offset) / 60);
      const offsetSign = offset >= 0 ? '+' : '-';

      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ` UTC ${offsetSign} ${offsetHours}`
      );
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-glass)] h-16 flex items-center px-4 md:px-6 gap-4 bg-[var(--bg-glass)] backdrop-blur-xl">
      {/* Mobile menu toggle */}
      <button
        id="mobile-menu-toggle"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] text-[var(--text-secondary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t.topbar.title}</h2>
      </div>

      {/* Date and time */}
      <div className="hidden md:flex items-center gap-2 text-sm text-[var(--text-secondary)] ml-2">
        <span className="font-mono">{dateStr}</span>
        <span className="text-[var(--border-glass)]">|</span>
        <span className="font-mono text-[var(--accent)]">{timeStr}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="flight-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.topbar.searchPlaceholder}
            className="w-48 sm:w-64 pl-10 pr-4 py-2 glass-input text-sm"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Track button */}
        <button
          id="search-button"
          onClick={onSearchSubmit}
          disabled={loading}
          className="btn-accent text-sm flex-shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">{t.topbar.searching}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
              </svg>
              <span className="hidden sm:inline">{t.topbar.track}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
