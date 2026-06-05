'use client';

import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import StatsCards from '@/components/StatsCards';
import FlightTable from '@/components/FlightTable';
import type { Flight } from '@/components/FlightSearch';
import { useLanguage } from '@/components/LanguageContext';

export default function FlightsPage() {
  const { t } = useLanguage();
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{t.flightsPage.title}</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          {t.flightsPage.subtitle}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-4 flex items-start gap-3 animate-fade-in" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-red-400">{t.flightsPage.errorTitle}</h4>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-5">
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
        <div className="glass-card p-8 text-center animate-fade-in">
          <svg className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{t.flightsPage.searchTitle}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{t.flightsPage.searchSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['AA123', 'ACA228', 'UA456'].map((example) => (
              <button
                key={example}
                onClick={() => setSearchValue(example)}
                className="px-4 py-2 glass-card text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--border-glow)] transition-all"
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
            <div className="glass-card p-8 text-center animate-fade-in">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{t.flightsPage.noFlightsTitle}</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                {t.flightsPage.noFlightsText.replace('{query}', searchValue)}
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
