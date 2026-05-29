'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import StatsCards from '@/components/StatsCards';
import FlightTable from '@/components/FlightTable';
import type { Flight } from '@/components/FlightSearch';
import { useLanguage } from '@/components/LanguageContext';

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
        <div className="flex flex-col items-center justify-center py-16 md:py-24 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-theme-100 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-theme-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dash-text mb-3 text-center">
            {t.dashboard.heroTitle}
          </h1>
          <p className="text-dash-muted text-center max-w-md mb-8">
            {t.dashboard.heroSubtitle}
          </p>

          {/* Recent Searches or Example Flights */}
          {hasRecent ? (
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-sm text-dash-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{t.dashboard.recentSearches}</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-dash-muted hover:text-red-500 transition-colors"
                >
                  {t.dashboard.clearHistory}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {recentSearches.map((recent, i) => (
                  <button
                    key={`${recent.flightNumber}-${recent.timestamp}`}
                    onClick={() => doSearch(recent.query)}
                    className="group flex items-center gap-3 px-4 py-3 bg-white border border-dash-border rounded-xl hover:border-theme-300 hover:bg-theme-50/50 hover:shadow-sm transition-all animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-theme-50 flex items-center justify-center flex-shrink-0 group-hover:bg-theme-100 transition-colors">
                      <svg className="w-4 h-4 text-theme-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-dash-text font-mono">
                          {recent.flightNumber}
                        </span>
                        <span className="text-xs text-dash-muted">·</span>
                        <span className="text-xs text-dash-muted font-medium truncate">
                          {recent.airline}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-dash-muted mt-0.5">
                        <span className="font-semibold text-dash-text">{recent.startIata}</span>
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="font-semibold text-dash-text">{recent.endIata}</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-theme-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {['AA123', 'ACA228', 'UA456'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setSearchValue(example);
                  }}
                  className="px-4 py-2 bg-white border border-dash-border rounded-lg text-sm font-mono text-dash-muted hover:text-theme-600 hover:border-theme-300 hover:bg-theme-50 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
            <h4 className="text-sm font-semibold text-red-800">
              {t.dashboard.errorTitle}
            </h4>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
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
                className="bg-white rounded-xl border border-dash-border p-5"
              >
                <div className="skeleton h-10 w-10 rounded-lg mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-dash-border p-5">
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
            <div className="bg-white rounded-xl border border-dash-border p-8 text-center animate-fade-in">
              <svg
                className="w-12 h-12 text-slate-300 mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-dash-text mb-1">
                {t.dashboard.noFlightsTitle}
              </h3>
              <p className="text-dash-muted text-sm">
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
      <div className="flex min-h-screen bg-dash-bg items-center justify-center">
        <div className="text-dash-muted text-sm">Loading…</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
