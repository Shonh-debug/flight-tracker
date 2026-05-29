'use client';

import { useLanguage } from '@/components/LanguageContext';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-dash-border h-16 flex items-center px-4 md:px-6 gap-4">
      {/* Mobile menu toggle */}
      <button
        id="mobile-menu-toggle"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-dash-muted transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-dash-text">{t.topbar.title}</h2>
      </div>

      {/* Date and time */}
      <div className="hidden md:flex items-center gap-2 text-sm text-dash-muted ml-2">
        <span className="font-mono">{dateStr}</span>
        <span className="text-slate-300">|</span>
        <span className="font-mono">{timeStr} UTC + 7</span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted"
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-dash-border rounded-lg text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-theme-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <button
        id="search-button"
        onClick={onSearchSubmit}
        disabled={loading}
        className="px-4 py-2 bg-theme-500 hover:bg-theme-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">{t.topbar.searching}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">{t.topbar.track}</span>
          </>
        )}
      </button>
    </header>
  );
}
