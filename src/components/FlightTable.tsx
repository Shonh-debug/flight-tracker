'use client';

import type { Flight } from './FlightSearch';

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':
      return 'badge-active';
    case 'Scheduled':
      return 'badge-scheduled';
    case 'Landed':
      return 'badge-landed';
    case 'Delayed':
    case 'Diverted':
      return 'badge-delayed';
    case 'Cancelled':
      return 'badge-cancelled';
    default:
      return 'badge-scheduled';
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-blue-500';
    case 'Scheduled':
      return 'bg-slate-400';
    case 'Landed':
      return 'bg-emerald-500';
    case 'Delayed':
    case 'Diverted':
      return 'bg-amber-500';
    case 'Cancelled':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

function createCalendarUrl(flight: Flight) {
  if (!flight.rawDeparture || !flight.rawArrival) return '#';
  try {
    // Aviation Stack returns local times with false +00:00 offset.
    // Extract the date/time directly from the string to avoid
    // new Date() misinterpreting them as UTC.
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

export default function FlightTable({ flights }: { flights: Flight[] }) {
  if (flights.length === 0) return null;

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
            {flights.map((flight, i) => (
              <tr
                key={flight.id}
                className="hover:bg-sky-50/50 transition-colors group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                onClick={() => window.open(createCalendarUrl(flight), '_blank')}
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(flight.status)} animate-pulse-dot`} />
                    <span className="font-semibold text-dash-text font-mono">{flight.flightNumber}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <div className="text-dash-text font-medium truncate max-w-[180px]">{flight.startLocation}</div>
                  <div className="text-xs text-dash-muted">{flight.startDate}</div>
                </td>
                <td className="py-3.5 px-5">
                  <div className="text-dash-text font-medium truncate max-w-[180px]">{flight.endLocation}</div>
                  <div className="text-xs text-dash-muted">{flight.endDate}</div>
                </td>
                <td className="py-3.5 px-5 font-mono text-dash-text">{flight.startTime}</td>
                <td className="py-3.5 px-5 font-mono text-dash-text">{flight.endTime}</td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(flight.status)}`}>
                    {flight.status}
                  </span>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-dash-border">
        {flights.map((flight, i) => (
          <a
            key={flight.id}
            href={createCalendarUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-4 hover:bg-sky-50/50 transition-colors animate-slide-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both', textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(flight.status)} animate-pulse-dot`} />
                <span className="font-bold text-dash-text font-mono">{flight.flightNumber}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(flight.status)}`}>
                {flight.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                <div className="text-dash-muted text-xs">From</div>
                <div className="font-medium text-dash-text truncate">{flight.startLocation}</div>
                <div className="text-xs text-dash-muted font-mono">{flight.startTime}</div>
              </div>
              <svg className="w-4 h-4 text-dash-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex-1 text-right">
                <div className="text-dash-muted text-xs">To</div>
                <div className="font-medium text-dash-text truncate">{flight.endLocation}</div>
                <div className="text-xs text-dash-muted font-mono">{flight.endTime}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
