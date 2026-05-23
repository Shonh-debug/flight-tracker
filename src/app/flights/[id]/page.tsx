'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Flight } from '@/components/FlightSearch';
import Sidebar from '@/components/Sidebar';

// ─── Status utilities ───

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

function createCalendarUrl(flight: Flight) {
  if (!flight.rawDeparture || !flight.rawArrival) return '#';
  try {
    const extract = (raw: string) => {
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!m) return '';
      return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00`;
    };
    const s = extract(flight.rawDeparture);
    const e = extract(flight.rawArrival);
    if (!s || !e) return '#';
    const title = encodeURIComponent(`Flight ${flight.flightNumber}`);
    const details = encodeURIComponent(`${flight.airlineName} flight ${flight.flightNumber} from ${flight.startLocation} to ${flight.endLocation}`);
    const location = encodeURIComponent(flight.startLocation);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${s}/${e}&details=${details}&location=${location}`;
  } catch {
    return '#';
  }
}

// ─── Info row component ───

function InfoRow({ label, value, accent, accentColor }: { label: string; value: string | null | undefined; accent?: boolean; accentColor?: 'amber' | 'emerald' }) {
  if (!value) return null;
  const colorClass = accent ? (accentColor === 'emerald' ? 'text-emerald-600' : 'text-amber-600') : 'text-dash-text';
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dash-border last:border-b-0">
      <span className="text-sm text-dash-muted">{label}</span>
      <span className={`text-sm font-medium ${colorClass} font-mono`}>{value}</span>
    </div>
  );
}

// ─── Page component ───

export default function FlightDetailPage() {
  const router = useRouter();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedFlight');
    if (stored) {
      try {
        setFlight(JSON.parse(stored));
      } catch {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!flight) {
    return (
      <div className="flex min-h-screen bg-dash-bg items-center justify-center">
        <div className="text-dash-muted text-sm">Loading flight details…</div>
      </div>
    );
  }

  const sc = getStatusColor(flight.status);
  const accentBar = getStatusAccentBar(flight.status);
  const isDelayed = (flight.departureDelay ?? 0) > 0 || (flight.arrivalDelay ?? 0) > 0;
  const isEarly = (flight.departureDelay ?? 0) < 0 || (flight.arrivalDelay ?? 0) < 0;
  const isCancelled = flight.status === 'Cancelled';
  const isActive = flight.status === 'Active' || flight.status === 'Scheduled';

  return (
    <div className="flex min-h-screen bg-dash-bg">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 border-b border-dash-border bg-white flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 -ml-2 text-dash-muted hover:text-dash-text rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <button onClick={() => {
            const lastSearch = sessionStorage.getItem('lastFlightSearch');
            if (lastSearch) {
              router.push(`/?q=${encodeURIComponent(lastSearch)}`);
            } else {
              router.push('/');
            }
          }} className="flex items-center gap-2 text-sm text-dash-muted hover:text-theme-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Results
          </button>

          <div className="flex-1" />

          {/* Add to Google Calendar */}
          <a
            href={createCalendarUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-dash-muted hover:text-theme-600 hover:bg-theme-50 border border-dash-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Add to Calendar
          </a>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto space-y-6">

          {/* Status accent bar + hero */}
          <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-fade-in">
            <div className={`h-1.5 bg-gradient-to-r ${accentBar}`} />

            <div className="p-5 md:p-8">
              {/* Flight number + airline + status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-dash-text font-mono">{flight.flightNumber}</h1>
                  <p className="text-dash-muted text-sm mt-0.5">{flight.airlineName} · {flight.flightDate}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {isDelayed && isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      +{Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)} min delay
                    </span>
                  )}
                  {isEarly && !isDelayed && isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)} min early
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    {flight.status}
                  </span>
                </div>
              </div>

              {/* Route visual */}
              <div className="flex items-center justify-between gap-4 mb-2">
                {/* Departure IATA */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-dash-text">{flight.startIata || '—'}</div>
                </div>

                {/* Route line */}
                <div className="flex-1 flex flex-col items-center gap-1.5 min-w-[80px]">
                  <svg className="w-6 h-6 text-theme-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" /></svg>
                  <div className="w-full h-px bg-gradient-to-r from-slate-200 via-theme-300 to-slate-200" />
                </div>

                {/* Arrival IATA */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-dash-text">{flight.endIata || '—'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-dash-muted mb-0">
                <span>{flight.startLocation}</span>
                <span className="text-right">{flight.endLocation}</span>
              </div>
            </div>
          </div>

          {/* Departure & Arrival cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Departure card */}
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="px-5 py-3 bg-slate-50 border-b border-dash-border">
                <h3 className="text-xs font-semibold text-dash-muted uppercase tracking-wider">Departure</h3>
              </div>
              <div className="p-5 space-y-0">
                <InfoRow label="Airport" value={flight.startLocation} />
                <InfoRow label="Airport Code" value={flight.startIata || undefined} />
                <InfoRow label="Timezone" value={flight.startTimeZone !== 'N/A' ? flight.startTimeZone : undefined} />
                <InfoRow label="Date" value={flight.startDate} />
                <InfoRow label="Scheduled" value={flight.startTime} />
                {isActive && flight.startEstimatedTime && (
                  <InfoRow label="Estimated" value={flight.startEstimatedTime} accent accentColor={(flight.departureDelay ?? 0) < 0 ? 'emerald' : 'amber'} />
                )}
                {flight.startTerminal && <InfoRow label="Terminal" value={flight.startTerminal} />}
                {flight.startGate && <InfoRow label="Gate" value={flight.startGate} />}
                {isActive && flight.departureDelay !== null && flight.departureDelay !== 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-dash-border last:border-b-0">
                    <span className="text-sm text-dash-muted">{flight.departureDelay < 0 ? 'Early' : 'Delay'}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                      flight.departureDelay < 0
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-amber-100 text-amber-700 border-amber-300'
                    }`}>
                      {flight.departureDelay < 0 ? `${Math.abs(flight.departureDelay)} min early` : `+${flight.departureDelay} min`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrival card */}
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <div className="px-5 py-3 bg-slate-50 border-b border-dash-border">
                <h3 className="text-xs font-semibold text-dash-muted uppercase tracking-wider">Arrival</h3>
              </div>
              <div className="p-5 space-y-0">
                <InfoRow label="Airport" value={flight.endLocation} />
                <InfoRow label="Airport Code" value={flight.endIata || undefined} />
                <InfoRow label="Timezone" value={flight.endTimeZone !== 'N/A' ? flight.endTimeZone : undefined} />
                <InfoRow label="Date" value={flight.endDate} />
                <InfoRow label="Scheduled" value={flight.endTime} />
                {isActive && flight.endEstimatedTime && (
                  <InfoRow label="Estimated" value={flight.endEstimatedTime} accent accentColor={(flight.arrivalDelay ?? 0) < 0 ? 'emerald' : 'amber'} />
                )}
                {flight.endTerminal && <InfoRow label="Terminal" value={flight.endTerminal} />}
                {flight.endGate && <InfoRow label="Gate" value={flight.endGate} />}
                {isActive && flight.arrivalDelay !== null && flight.arrivalDelay !== 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-dash-border last:border-b-0">
                    <span className="text-sm text-dash-muted">{flight.arrivalDelay < 0 ? 'Early' : 'Delay'}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                      flight.arrivalDelay < 0
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-amber-100 text-amber-700 border-amber-300'
                    }`}>
                      {flight.arrivalDelay < 0 ? `${Math.abs(flight.arrivalDelay)} min early` : `+${flight.arrivalDelay} min`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cancelled / Incident banner */}
          {(isCancelled || flight.status === 'Incident' || flight.status === 'Diverted') && (
            <div className={`rounded-xl border p-4 flex items-start gap-3 animate-fade-in ${sc.border} ${sc.bg}`}>
              <svg className={`w-5 h-5 ${sc.text} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className={`text-sm font-semibold ${sc.text}`}>
                  Flight {flight.status}
                </h4>
                <p className={`text-sm ${sc.text} opacity-80 mt-0.5`}>
                  {isCancelled && 'This flight has been cancelled by the airline. Please contact your carrier for alternatives.'}
                  {flight.status === 'Diverted' && 'This flight has been diverted from its original destination.'}
                  {flight.status === 'Incident' && 'An incident has been reported for this flight. Please check with the airline for details.'}
                </p>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-dash-border px-6 py-3 flex items-center justify-between text-xs text-dash-muted">
          <span>FlightTracker © {new Date().getFullYear()}</span>
          <span>Powered by Aviation Stack API</span>
        </footer>
      </div>
    </div>
  );
}
