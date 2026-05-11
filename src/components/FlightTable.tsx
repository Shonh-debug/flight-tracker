'use client';

import { useRouter } from 'next/navigation';
import type { Flight } from './FlightSearch';

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':    return 'badge-active';
    case 'Scheduled': return 'badge-scheduled';
    case 'Landed':    return 'badge-landed';
    case 'Delayed':
    case 'Diverted':  return 'badge-delayed';
    case 'Cancelled': return 'badge-cancelled';
    case 'Incident':  return 'badge-incident';
    default:          return 'badge-scheduled';
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case 'Active':    return 'bg-blue-500 animate-pulse-dot';
    case 'Scheduled': return 'bg-slate-400';
    case 'Landed':    return 'bg-emerald-500';
    case 'Diverted':  return 'bg-amber-500';
    case 'Cancelled': return 'bg-red-500';
    case 'Incident':  return 'bg-orange-500';
    default:          return 'bg-slate-400';
  }
}

function createCalendarUrl(flight: Flight) {
  if (!flight.rawDeparture || !flight.rawArrival) return '#';
  try {
    const extractCalendarTime = (raw: string) => {
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!match) return '';
      return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}00`;
    };
    const start = extractCalendarTime(flight.rawDeparture);
    const end = extractCalendarTime(flight.rawArrival);
    if (!start || !end) return '#';
    const title = encodeURIComponent(`Flight ${flight.flightNumber}`);
    const details = encodeURIComponent(
      `Flight ${flight.flightNumber} from ${flight.startLocation} to ${flight.endLocation}`
    );
    const location = encodeURIComponent(flight.startLocation);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  } catch {
    return '#';
  }
}

function DelayBadge({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      +{minutes}m
    </span>
  );
}

function TimeCell({
  scheduled,
  estimated,
  delay,
  isActive,
}: {
  scheduled: string;
  estimated: string | null;
  delay: number | null;
  isActive: boolean;
}) {
  const hasDelay = isActive && delay !== null && delay > 0;
  const hasEstimated = isActive && estimated !== null && estimated !== scheduled;

  return (
    <div className="font-mono">
      <div className={`text-sm ${hasDelay ? 'line-through text-dash-muted' : 'text-dash-text'}`}>
        {scheduled}
      </div>
      {hasEstimated && (
        <div className="text-xs text-amber-600 font-semibold mt-0.5">{estimated}</div>
      )}
    </div>
  );
}

export default function FlightTable({ flights }: { flights: Flight[] }) {
  const router = useRouter();
  if (flights.length === 0) return null;

  const navigateToDetail = (flight: Flight) => {
    // Store flight data in sessionStorage so the detail page can read it
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    // Store the current search query so the detail page can link back to results
    const currentSearch = new URLSearchParams(window.location.search).get('q') || flight.flightNumber;
    sessionStorage.setItem('lastFlightSearch', currentSearch);
    router.push(`/flights/${encodeURIComponent(flight.id)}`);
  };

  return (
    <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-fade-in">
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-dash-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-dash-text">Flight List</h3>
          <p className="text-xs text-dash-muted mt-0.5">{flights.length} result{flights.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs text-dash-muted font-medium">Live</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dash-border bg-slate-50/50">
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Flight</th>
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Origin</th>
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Destination</th>
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Departure</th>
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Arrival</th>
              <th className="text-left py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Status</th>
              <th className="text-center py-3 px-5 font-semibold text-dash-muted text-xs uppercase tracking-wider">Calendar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border">
            {flights.map((flight, i) => {
              const isActive = flight.status === 'Active' || flight.status === 'Scheduled';
              const isPast = flight.status === 'Landed' || flight.status === 'Cancelled' || flight.status === 'Incident' || flight.status === 'Diverted';
              const depDelay = flight.departureDelay;
              const arrDelay = flight.arrivalDelay;

              return (
                <tr
                  key={flight.id}
                  className={`hover:bg-sky-50/50 transition-colors group cursor-pointer animate-slide-up ${isPast ? 'opacity-70' : ''}`}
                  style={{ animationDelay: `${Math.min(i * 30, 800)}ms`, animationFillMode: 'both' }}
                  onClick={() => navigateToDetail(flight)}
                >
                  {/* Flight number + delay badge */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(flight.status)}`} />
                      <span className="font-semibold text-dash-text font-mono">{flight.flightNumber}</span>
                      {isActive && depDelay !== null && depDelay > 0 && (
                        <DelayBadge minutes={depDelay} />
                      )}
                    </div>
                  </td>

                  {/* Origin */}
                  <td className="py-3.5 px-5">
                    <div className="text-dash-text font-medium truncate max-w-[160px]">{flight.startLocation}</div>
                    <div className="text-xs text-dash-muted">{flight.startDate}</div>
                  </td>

                  {/* Destination */}
                  <td className="py-3.5 px-5">
                    <div className="text-dash-text font-medium truncate max-w-[160px]">{flight.endLocation}</div>
                    <div className="text-xs text-dash-muted">{flight.endDate}</div>
                  </td>

                  {/* Departure time */}
                  <td className="py-3.5 px-5">
                    <TimeCell
                      scheduled={flight.startTime}
                      estimated={flight.startEstimatedTime ?? null}
                      delay={depDelay ?? null}
                      isActive={isActive}
                    />
                  </td>

                  {/* Arrival time */}
                  <td className="py-3.5 px-5">
                    <TimeCell
                      scheduled={flight.endTime}
                      estimated={flight.endEstimatedTime ?? null}
                      delay={arrDelay ?? null}
                      isActive={isActive}
                    />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(flight.status)}`}>
                      {flight.status}
                    </span>
                  </td>

                  {/* Calendar */}
                  <td className="py-3.5 px-5 text-center">
                    <a
                      href={createCalendarUrl(flight)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-dash-muted hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Add to Google Calendar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-dash-border">
        {flights.map((flight, i) => {
          const isActive = flight.status === 'Active' || flight.status === 'Scheduled';
          const isPast = flight.status === 'Landed' || flight.status === 'Cancelled' || flight.status === 'Incident' || flight.status === 'Diverted';
          const depDelay = flight.departureDelay;

          return (
            <div
              key={flight.id}
              className={`block px-4 py-4 hover:bg-sky-50/50 transition-colors animate-slide-up cursor-pointer ${isPast ? 'opacity-70' : ''}`}
              style={{ animationDelay: `${Math.min(i * 30, 800)}ms`, animationFillMode: 'both' }}
              onClick={() => navigateToDetail(flight)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(flight.status)}`} />
                  <span className="font-bold text-dash-text font-mono">{flight.flightNumber}</span>
                  {isActive && depDelay !== null && depDelay > 0 && (
                    <DelayBadge minutes={depDelay} />
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(flight.status)}`}>
                  {flight.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <div className="text-dash-muted text-xs">From</div>
                  <div className="font-medium text-dash-text truncate">{flight.startLocation}</div>
                  <div className="text-xs text-dash-muted font-mono">{flight.startDate}</div>
                  <TimeCell
                    scheduled={flight.startTime}
                    estimated={flight.startEstimatedTime ?? null}
                    delay={flight.departureDelay ?? null}
                    isActive={isActive}
                  />
                </div>
                <svg className="w-4 h-4 text-dash-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="flex-1 text-right">
                  <div className="text-dash-muted text-xs">To</div>
                  <div className="font-medium text-dash-text truncate">{flight.endLocation}</div>
                  <div className="text-xs text-dash-muted font-mono">{flight.endDate}</div>
                  <div className="flex justify-end">
                    <TimeCell
                      scheduled={flight.endTime}
                      estimated={flight.endEstimatedTime ?? null}
                      delay={flight.arrivalDelay ?? null}
                      isActive={isActive}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
