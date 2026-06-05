'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Flight } from '@/components/FlightSearch';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/components/LanguageContext';

// ─── Status utilities ───

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':    return { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',   dot: 'bg-blue-500 animate-pulse'    };
    case 'Scheduled': return { bg: 'bg-slate-500/15',   text: 'text-slate-400',   border: 'border-slate-500/30',  dot: 'bg-slate-400'                  };
    case 'Landed':    return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30',dot: 'bg-emerald-500'                };
    case 'Cancelled': return { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30',    dot: 'bg-red-500'                    };
    case 'Diverted':  return { bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'border-purple-500/30', dot: 'bg-purple-500'                 };
    case 'Incident':  return { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30', dot: 'bg-orange-500'                 };
    default:          return { bg: 'bg-slate-500/15',   text: 'text-slate-400',   border: 'border-slate-500/30',  dot: 'bg-slate-400'                  };
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
    default:          return 'from-[var(--accent)] to-[var(--accent)]';
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
  const colorClass = accent ? (accentColor === 'emerald' ? 'text-emerald-400' : 'text-amber-400') : 'text-[var(--text-primary)]';
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-glass)] last:border-b-0">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-sm font-medium ${colorClass} font-mono`}>{value}</span>
    </div>
  );
}

// ─── Page component ───

export default function FlightDetailPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

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

  useEffect(() => {
    if (!flight) return;
    try {
      const savedList = localStorage.getItem('flight_tracker_watchlist');
      const watchlist: Flight[] = savedList ? JSON.parse(savedList) : [];
      setIsSaved(watchlist.some((f) => f.id === flight.id));
    } catch (e) {
      console.error(e);
    }
  }, [flight]);

  const toggleWatchlist = () => {
    if (!flight) return;
    try {
      const savedList = localStorage.getItem('flight_tracker_watchlist');
      let watchlist: Flight[] = savedList ? JSON.parse(savedList) : [];
      const alreadySaved = watchlist.some((f) => f.id === flight.id);

      if (alreadySaved) {
        watchlist = watchlist.filter((f) => f.id !== flight.id);
        setIsSaved(false);
      } else {
        watchlist.push(flight);
        setIsSaved(true);
      }
      localStorage.setItem('flight_tracker_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  };

  if (!flight) {
    return (
      <div className="flex min-h-screen topo-bg items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-[var(--text-secondary)] text-sm">{t.flightDetail.loadingDetails}</div>
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
    <div className="flex min-h-screen topo-bg" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-xl flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <button onClick={() => {
            const lastSearch = sessionStorage.getItem('lastFlightSearch');
            if (lastSearch) {
              router.push(`/?q=${encodeURIComponent(lastSearch)}`);
            } else {
              router.push('/');
            }
          }} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t.flightDetail.backToResults}
          </button>

          <div className="flex-1" />

          {/* Watchlist Toggle */}
          <button
            onClick={toggleWatchlist}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              isSaved
                ? 'bg-[var(--accent)] text-[#0f172a] border-[var(--accent)] hover:opacity-90'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] border-[var(--border-glass)]'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {isSaved ? t.flightDetail.inWatchlist : t.flightDetail.addToWatchlist}
          </button>

          {/* Add to Google Calendar */}
          <a
            href={createCalendarUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] border border-[var(--border-glass)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {t.flightDetail.addToCalendar}
          </a>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto space-y-6">

          {/* Status accent bar + hero */}
          <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
            <div className={`h-1.5 bg-gradient-to-r ${accentBar}`} />

            <div className="p-5 md:p-8">
              {/* Flight number + airline + status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono">{flight.flightNumber}</h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">{flight.airlineName} · {flight.flightDate}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {isDelayed && isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t.flightDetail.minDelayLabel.replace('{min}', String(Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)))}
                    </span>
                  )}
                  {isEarly && !isDelayed && isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t.flightDetail.minEarly.replace('{min}', String(Math.abs(flight.departureDelay ?? flight.arrivalDelay ?? 0)))}
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
                  <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{flight.startIata || '—'}</div>
                </div>

                {/* Route line */}
                <div className="flex-1 flex flex-col items-center gap-1.5 min-w-[80px]">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" /></svg>
                  <div className="w-full h-px bg-gradient-to-r from-[var(--border-glass)] via-[var(--accent)] to-[var(--border-glass)]" />
                </div>

                {/* Arrival IATA */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{flight.endIata || '—'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-0">
                <span>{flight.startLocation}</span>
                <span className="text-right">{flight.endLocation}</span>
              </div>
            </div>
          </div>

          {/* Departure & Arrival cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Departure card */}
            <div className="glass-card rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="px-5 py-3 bg-[var(--accent-muted)] border-b border-[var(--border-glass)]">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{t.flightDetail.departure}</h3>
              </div>
              <div className="p-5 space-y-0">
                <InfoRow label={t.flightDetail.airport} value={flight.startLocation} />
                <InfoRow label={t.flightDetail.airportCode} value={flight.startIata || undefined} />
                <InfoRow label={t.flightDetail.timezone} value={flight.startTimeZone !== 'N/A' ? flight.startTimeZone : undefined} />
                <InfoRow label={t.flightDetail.date} value={flight.startDate} />
                <InfoRow label={t.flightDetail.scheduled} value={flight.startTime} />
                {isActive && flight.startEstimatedTime && (
                  <InfoRow label={t.flightDetail.estimated} value={flight.startEstimatedTime} accent accentColor={(flight.departureDelay ?? 0) < 0 ? 'emerald' : 'amber'} />
                )}
                {flight.startTerminal && <InfoRow label={t.flightDetail.terminal} value={flight.startTerminal} />}
                {flight.startGate && <InfoRow label={t.flightDetail.gate} value={flight.startGate} />}
                {isActive && flight.departureDelay !== null && flight.departureDelay !== 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-glass)] last:border-b-0">
                    <span className="text-sm text-[var(--text-secondary)]">{flight.departureDelay < 0 ? t.flightDetail.early : t.flightDetail.delay}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                      flight.departureDelay < 0
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {flight.departureDelay < 0 ? t.flightDetail.minEarly.replace('{min}', String(Math.abs(flight.departureDelay))) : t.flightDetail.minDelay.replace('{min}', String(flight.departureDelay))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrival card */}
            <div className="glass-card rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <div className="px-5 py-3 bg-[var(--accent-muted)] border-b border-[var(--border-glass)]">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{t.flightDetail.arrival}</h3>
              </div>
              <div className="p-5 space-y-0">
                <InfoRow label={t.flightDetail.airport} value={flight.endLocation} />
                <InfoRow label={t.flightDetail.airportCode} value={flight.endIata || undefined} />
                <InfoRow label={t.flightDetail.timezone} value={flight.endTimeZone !== 'N/A' ? flight.endTimeZone : undefined} />
                <InfoRow label={t.flightDetail.date} value={flight.endDate} />
                <InfoRow label={t.flightDetail.scheduled} value={flight.endTime} />
                {isActive && flight.endEstimatedTime && (
                  <InfoRow label={t.flightDetail.estimated} value={flight.endEstimatedTime} accent accentColor={(flight.arrivalDelay ?? 0) < 0 ? 'emerald' : 'amber'} />
                )}
                {flight.endTerminal && <InfoRow label={t.flightDetail.terminal} value={flight.endTerminal} />}
                {flight.endGate && <InfoRow label={t.flightDetail.gate} value={flight.endGate} />}
                {isActive && flight.arrivalDelay !== null && flight.arrivalDelay !== 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-glass)] last:border-b-0">
                    <span className="text-sm text-[var(--text-secondary)]">{flight.arrivalDelay < 0 ? t.flightDetail.early : t.flightDetail.delay}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                      flight.arrivalDelay < 0
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {flight.arrivalDelay < 0 ? t.flightDetail.minEarly.replace('{min}', String(Math.abs(flight.arrivalDelay))) : t.flightDetail.minDelay.replace('{min}', String(flight.arrivalDelay))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cancelled / Incident banner */}
          {(isCancelled || flight.status === 'Incident' || flight.status === 'Diverted') && (
            <div className={`glass-card rounded-xl p-4 flex items-start gap-3 animate-fade-in border ${sc.border}`}>
              <svg className={`w-5 h-5 ${sc.text} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className={`text-sm font-semibold ${sc.text}`}>
                  {t.flightDetail.flightStatusPrefix} {flight.status}
                </h4>
                <p className={`text-sm ${sc.text} opacity-80 mt-0.5`}>
                  {isCancelled && t.flightDetail.flightCancelled}
                  {flight.status === 'Diverted' && t.flightDetail.flightDiverted}
                  {flight.status === 'Incident' && t.flightDetail.flightIncident}
                </p>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border-glass)] px-6 py-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{t.footer.copyright} © {new Date().getFullYear()}</span>
          <span>{t.footer.poweredBy}</span>
        </footer>
      </div>
    </div>
  );
}
