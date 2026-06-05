'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardShell from '@/components/DashboardShell';
import StatsCards from '@/components/StatsCards';
import FlightTable from '@/components/FlightTable';
import type { Flight } from '@/components/FlightSearch';
import { useLanguage } from '@/components/LanguageContext';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

const RECENT_SEARCHES_KEY = 'flight_tracker_recent_searches';
const MAX_RECENT = 5;

type RecentSearch = {
  query: string;
  flightNumber: string;
  startIata: string;
  endIata: string;
  airline: string;
  timestamp: number;
};

function loadRecentSearches(): RecentSearch[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(entry: Omit<RecentSearch, 'timestamp'>) {
  const existing = loadRecentSearches();
  // Remove duplicates by flight number
  const filtered = existing.filter(
    (s) => s.flightNumber.toUpperCase() !== entry.flightNumber.toUpperCase()
  );
  const updated: RecentSearch[] = [
    { ...entry, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    setRecentSearches(loadRecentSearches());
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setSearchValue(query);
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/flights?flightNumber=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Server error: ${res.status}`);
        setFlights([]);
        return;
      }

      const fetchedFlights: Flight[] = data.flights || [];
      setFlights(fetchedFlights);

      // Save to recent searches if we got results
      if (fetchedFlights.length > 0) {
        const first = fetchedFlights[0];
        const updated = saveRecentSearch({
          query: query.trim(),
          flightNumber: first.flightNumber,
          startIata: first.startIata,
          endIata: first.endIata,
          airline: first.airlineName,
        });
        setRecentSearches(updated);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch flights');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if the URL has a ?q= parameter (e.g., coming back from flight detail)
  // Reset to empty command center when navigating home (no q param)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      doSearch(q);
    } else {
      setSearchValue('');
      setFlights([]);
      setSearched(false);
      setError(null);
    }
  }, [searchParams, doSearch]);

  const handleSearch = async () => {
    await doSearch(searchValue);
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const hasRecent = isClient && recentSearches.length > 0;

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={handleSearch}
      loading={loading}
    >
      {/* Welcome / Hero when no search has been done */}
      {!searched && (
        <div className="animate-fade-in">
          {/* Hero section with globe */}
          <div className="flex flex-col lg:flex-row items-center gap-8 py-8 md:py-12">
            {/* Left side: Title + search prompt */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
                <span className="text-glow text-[var(--accent)]">Flight Tracker</span>{' '}
                {t.dashboard.heroTitle.replace('Flight Tracker Command Center', 'Dashboard')}
              </h1>
              <p className="text-[var(--text-secondary)] max-w-md mb-8">
                {t.dashboard.heroSubtitle}
              </p>

              {/* Example flight buttons (shown when no recent searches) */}
              {!hasRecent && (
                <div className="flex flex-wrap gap-3">
                  {['AA123', 'ACA228', 'UA456'].map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setSearchValue(example);
                      }}
                      className="px-4 py-2 glass-card text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--border-glow)] transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Globe */}
            <div className="flex-shrink-0 w-64 md:w-80 lg:w-96">
              <Globe />
            </div>
          </div>

          {/* Recent Searches */}
          {hasRecent && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-[var(--text-primary)]">{t.dashboard.recentSearches}</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                >
                  {t.dashboard.clearHistory}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {recentSearches.map((recent, i) => (
                  <button
                    key={`${recent.flightNumber}-${recent.timestamp}`}
                    onClick={() => doSearch(recent.query)}
                    className="group glass-card px-4 py-3 text-left animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  >
                    {/* Flight number + airline */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
                          {recent.flightNumber}
                        </span>
                        <span className="text-[var(--border-glass)]">·</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium truncate">
                          {recent.airline}
                        </span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
                      </svg>
                    </div>
                    {/* Route */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-[var(--text-primary)] font-mono">{recent.startIata}</span>
                      <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="font-bold text-[var(--text-primary)] font-mono">{recent.endIata}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-card p-4 flex items-start gap-3 animate-fade-in border-red-500/30" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-red-400">
              {t.dashboard.errorTitle}
            </h4>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-5"
              >
                <div className="skeleton h-10 w-10 rounded-lg mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="glass-card p-5">
            <div className="skeleton h-5 w-32 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full mb-3 last:mb-0" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && searched && !error && (
        <>
          <StatsCards flights={flights} />

          {flights.length === 0 ? (
            <div className="glass-card p-8 text-center animate-fade-in">
              <svg
                className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {t.dashboard.noFlightsTitle}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                {t.dashboard.noFlightsText.replace('{query}', searchValue)}
              </p>
            </div>
          ) : (
            <FlightTable flights={flights} />
          )}
        </>
      )}
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-[var(--text-secondary)] text-sm">Loading…</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
