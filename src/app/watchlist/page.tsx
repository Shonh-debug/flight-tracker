'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import type { Flight } from '@/components/FlightSearch';

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':    return { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-500 animate-pulse'    };
    case 'Scheduled': return { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',  dot: 'bg-slate-400'                  };
    case 'Landed':    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-500'                };
    case 'Cancelled': return { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-300',    dot: 'bg-red-500'                    };
    case 'Diverted':  return { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200', dot: 'bg-purple-500'                 };
    case 'Incident':  return { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200', dot: 'bg-orange-500'                 };
    default:          return { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',  dot: 'bg-slate-400'                  };
  }
}

function getStatusAccentBar(status: string) {
  switch (status) {
    case 'Active':    return 'from-blue-400 to-blue-600';
    case 'Scheduled': return 'from-slate-300 to-slate-500';
    case 'Landed':    return 'from-emerald-400 to-emerald-600';
    case 'Cancelled': return 'from-red-400 to-red-600';
    case 'Diverted':  return 'from-purple-400 to-purple-600';
    case 'Incident':  return 'from-orange-400 to-orange-600';
    default:          return 'from-theme-400 to-theme-600';
  }
}

export default function WatchlistPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [watchlist, setWatchlist] = useState<Flight[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedList = localStorage.getItem('flight_tracker_watchlist');
      if (savedList) {
        setWatchlist(JSON.parse(savedList));
      }
    } catch (e) {
      console.error('Failed to parse watchlist from localStorage', e);
    }
  }, []);

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      router.push(`/?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleRemove = (e: React.MouseEvent, flightId: string) => {
    e.stopPropagation();
    try {
      const updated = watchlist.filter((f) => f.id !== flightId);
      setWatchlist(updated);
      localStorage.setItem('flight_tracker_watchlist', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save updated watchlist', e);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      try {
        setWatchlist([]);
        localStorage.removeItem('flight_tracker_watchlist');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCardClick = (flight: Flight) => {
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    sessionStorage.setItem('lastFlightSearch', flight.flightNumber);
    router.push(`/flights/${encodeURIComponent(flight.id)}`);
  };

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={handleSearchSubmit}
      loading={false}
    >
      <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dash-text mb-1">Watchlist</h1>
          <p className="text-dash-muted text-sm">
            Your personal flight board. Keep track of pinned flights and monitor their schedule in real time.
          </p>
        </div>
        {isClient && watchlist.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors self-start sm:self-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {isClient && watchlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-dash-border p-12 text-center animate-slide-up max-w-xl mx-auto mt-8">
          <div className="w-16 h-16 rounded-2xl bg-theme-50 flex items-center justify-center mx-auto mb-6 ring-8 ring-theme-50/50">
            <svg className="w-8 h-8 text-theme-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dash-text mb-2 font-sans">No Pinned Flights</h3>
          <p className="text-dash-muted text-sm max-w-sm mx-auto mb-6">
            Track flights and bookmark them from their details page to create your personal live dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-theme-500 text-white hover:bg-theme-600 transition-colors shadow-sm"
          >
            Search Flights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {isClient && watchlist.map((flight, idx) => {
            const sc = getStatusColor(flight.status);
            const accentBar = getStatusAccentBar(flight.status);
            const isDelayed = (flight.departureDelay ?? 0) > 0 || (flight.arrivalDelay ?? 0) > 0;
            const isEarly = (flight.departureDelay ?? 0) < 0 || (flight.arrivalDelay ?? 0) < 0;
            const isActive = flight.status === 'Active' || flight.status === 'Scheduled';

            return (
              <div
                key={flight.id}
                onClick={() => handleCardClick(flight)}
                className="bg-white rounded-xl border border-dash-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer animate-slide-up relative"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                <div className={`h-1 bg-gradient-to-r ${accentBar}`} />
                
                <div className="p-5 flex-1 flex flex-col">
                  {/* Card Header: Flight Number, Airline, Remove button */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-dash-text font-mono tracking-tight group-hover:text-theme-600 transition-colors">
                          {flight.flightNumber}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {flight.status}
                        </span>
                      </div>
                      <p className="text-xs text-dash-muted mt-0.5">{flight.airlineName}</p>
                    </div>

                    {/* Unpin/Bookmark Button */}
                    <button
                      onClick={(e) => handleRemove(e, flight.id)}
                      className="p-1.5 rounded-lg text-dash-muted hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                      title="Remove from watchlist"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Route Section */}
                  <div className="bg-slate-50/50 rounded-lg p-3 border border-dash-border/50 mb-4 flex items-center justify-between gap-4">
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-xl font-bold text-dash-text font-mono truncate">{flight.startIata || '—'}</div>
                      <div className="text-[10px] text-dash-muted truncate font-medium">{flight.startLocation}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[50px]">
                      <svg className="w-4 h-4 text-theme-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
                      </svg>
                      <div className="w-full h-px bg-gradient-to-r from-slate-100 via-theme-300 to-slate-100" />
                    </div>
                    <div className="text-right flex-1 min-w-0">
                      <div className="text-xl font-bold text-dash-text font-mono truncate">{flight.endIata || '—'}</div>
                      <div className="text-[10px] text-dash-muted truncate font-medium">{flight.endLocation}</div>
                    </div>
                  </div>

                  {/* Next Departure Info */}
                  <div className="mt-auto border-t border-dash-border/50 pt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dash-muted flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Departure Date
                      </span>
                      <span className="font-semibold text-dash-text font-mono">{flight.startDate}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dash-muted flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Scheduled Time
                      </span>
                      <span className="font-semibold text-dash-text font-mono">{flight.startTime}</span>
                    </div>

                    {/* Delay / Early labels if active */}
                    {isActive && (isDelayed || isEarly) && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dash-muted">Status Info</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          isEarly
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-amber-100 text-amber-700 border-amber-300'
                        }`}>
                          {isEarly
                            ? `${Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)}m early`
                            : `+${Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)}m delay`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
