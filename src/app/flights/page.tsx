'use client';

import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import StatsCards from '@/components/StatsCards';
import FlightTable from '@/components/FlightTable';
import type { Flight } from '@/components/FlightSearch';

export default function FlightsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/flights?flightNumber=${encodeURIComponent(searchValue)}`
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
  };

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={handleSearch}
      loading={loading}
    >
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-dash-text mb-1">Flights</h1>
        <p className="text-dash-muted text-sm mb-6">
          Search and track any flight in real time. Enter a flight number in the search bar above.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-red-800">Error fetching flight data</h4>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-dash-border p-5">
                <div className="skeleton h-10 w-10 rounded-lg mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No search yet — show prompt */}
      {!loading && !searched && !error && (
        <div className="bg-white rounded-xl border border-dash-border p-8 text-center animate-fade-in">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-dash-text mb-1">Search for a flight</h3>
          <p className="text-dash-muted text-sm">Use the search bar above to look up any flight by its IATA or ICAO code.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['AA123', 'ACA228', 'UA456'].map((example) => (
              <button
                key={example}
                onClick={() => setSearchValue(example)}
                className="px-4 py-2 bg-slate-50 border border-dash-border rounded-lg text-sm font-mono text-dash-muted hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all"
              >
                {example}
              </button>
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
              <h3 className="text-lg font-semibold text-dash-text mb-1">No flights found</h3>
              <p className="text-dash-muted text-sm">
                No flights found matching &quot;{searchValue}&quot;. Try AA123 or ACA228.
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
