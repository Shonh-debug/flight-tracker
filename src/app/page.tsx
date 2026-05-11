'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import StatsCards from '@/components/StatsCards';
import FlightTable from '@/components/FlightTable';
import type { Flight } from '@/components/FlightSearch';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setFlights(data.flights || []);
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
          <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-sky-500"
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
            Flight Tracker Command Center
          </h1>
          <p className="text-dash-muted text-center max-w-md mb-8">
            Enter a flight number above to get real-time status updates,
            departure and arrival information, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['AA123', 'ACA228', 'UA456'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setSearchValue(example);
                }}
                className="px-4 py-2 bg-white border border-dash-border rounded-lg text-sm font-mono text-dash-muted hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
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
              Error fetching flight data
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
                No flights found
              </h3>
              <p className="text-dash-muted text-sm">
                No flights found matching &quot;{searchValue}&quot;. Try
                AA123 or ACA228.
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
