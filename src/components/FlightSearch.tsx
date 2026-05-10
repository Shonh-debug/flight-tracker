'use client';

import { useState } from 'react';

export type Flight = {
  id: string;
  flightNumber: string;
  startTime: string;
  endTime: string;
  startEstimatedTime: string | null;
  endEstimatedTime: string | null;
  startDate: string;
  endDate: string;
  startTimeZone: string;
  endTimeZone: string;
  startLocation: string;
  endLocation: string;
  status: string;
  departureDelay: number | null;
  arrivalDelay: number | null;
  rawDeparture: string;
  rawArrival: string;
};

// Returns CSS variables for each status
function getStatusStyle(status: string): { color: string; background: string } {
  switch (status) {
    case 'Active':
      return { color: '#34d399', background: 'rgba(52, 211, 153, 0.12)' };
    case 'Scheduled':
      return { color: '#60a5fa', background: 'rgba(96, 165, 250, 0.12)' };
    case 'Landed':
      return { color: '#a3e635', background: 'rgba(163, 230, 53, 0.12)' };
    case 'Cancelled':
      return { color: '#f87171', background: 'rgba(248, 113, 113, 0.12)' };
    case 'Diverted':
      return { color: '#c084fc', background: 'rgba(192, 132, 252, 0.12)' };
    case 'Incident':
      return { color: '#fb923c', background: 'rgba(251, 146, 60, 0.12)' };
    default:
      return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.12)' };
  }
}

// Returns the top-border gradient for each status
function getCardAccent(status: string): string {
  switch (status) {
    case 'Active':    return 'linear-gradient(to right, #34d399, #059669)';
    case 'Scheduled': return 'linear-gradient(to right, #60a5fa, #3b82f6)';
    case 'Landed':    return 'linear-gradient(to right, #a3e635, #65a30d)';
    case 'Cancelled': return 'linear-gradient(to right, #f87171, #dc2626)';
    case 'Diverted':  return 'linear-gradient(to right, #c084fc, #9333ea)';
    case 'Incident':  return 'linear-gradient(to right, #fb923c, #ea580c)';
    default:          return 'linear-gradient(to right, #60a5fa, #c084fc)';
  }
}

export default function FlightSearch() {
  const [flightNumber, setFlightNumber] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await fetch(`/api/flights?flightNumber=${encodeURIComponent(flightNumber)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Server error: ${res.status}`);
        setFlights([]);
        return;
      }

      setFlights(data.flights || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch flights");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-container">
        <form onSubmit={handleSearch} className="flight-form">
          <input
            type="text"
            className="flight-input"
            placeholder="Enter flight number (e.g. AA123 or ACA228)"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Track Flight'}
          </button>
        </form>
      </div>

      <div className="results-container">
        {loading && <div className="empty-state">Looking up flight details...</div>}

        {error && <div className="empty-state" style={{ color: '#ef4444' }}>{error}</div>}

        {!loading && !error && searched && flights.length === 0 && (
          <div className="empty-state">No flights found matching "{flightNumber}". Try AA123 or ACA228.</div>
        )}

        {!loading && flights.map((flight) => {
          const statusStyle = getStatusStyle(flight.status);
          const cardAccent = getCardAccent(flight.status);
          const isDelayed = (flight.departureDelay ?? 0) > 0 || (flight.arrivalDelay ?? 0) > 0;
          const isCancelled = flight.status === 'Cancelled';

          const createCalendarUrl = (flight: Flight) => {
            if (!flight.rawDeparture || !flight.rawArrival) return '#';
            try {
              const start = new Date(flight.rawDeparture).toISOString().replace(/-|:|\.\d\d\d/g, "");
              const end = new Date(flight.rawArrival).toISOString().replace(/-|:|\.\d\d\d/g, "");
              const title = encodeURIComponent(`Flight ${flight.flightNumber}`);
              const details = encodeURIComponent(`Flight ${flight.flightNumber} from ${flight.startLocation} to ${flight.endLocation}`);
              const location = encodeURIComponent(flight.startLocation);
              return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
            } catch {
              return '#';
            }
          };

          return (
            <a
              key={flight.id}
              href={createCalendarUrl(flight)}
              target="_blank"
              rel="noopener noreferrer"
              className="flight-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                '--card-accent': cardAccent,
              } as React.CSSProperties}
            >
              {/* Header */}
              <div className="flight-header">
                <div className="flight-number">{flight.flightNumber}</div>
                <div className="flight-header-badges">
                  {/* Delay badge — only show for active/scheduled flights with a real delay */}
                  {isDelayed && !isCancelled && (flight.status === 'Active' || flight.status === 'Scheduled') && (
                    <div className="delay-badge">
                      ⚠ {flight.departureDelay ? `+${flight.departureDelay} min` : `+${flight.arrivalDelay} min`} delay
                    </div>
                  )}
                  {/* Color-coded status badge */}
                  <div className="flight-status" style={statusStyle}>
                    {flight.status}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flight-body">
                {/* Departure */}
                <div className="location-group">
                  <div className={`time ${isDelayed && !isCancelled ? 'time-original' : ''}`}>
                    {flight.startTime}
                  </div>
                  {flight.startEstimatedTime && (
                    <div className="time-estimated">
                      Est. {flight.startEstimatedTime}
                    </div>
                  )}
                  <div className="location">{flight.startLocation}</div>
                  <div className="timezone">{flight.startDate}</div>
                </div>

                {/* Path */}
                <div className="flight-path">
                  <div className="airplane-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z"/>
                    </svg>
                  </div>
                  <div className="path-line"></div>
                </div>

                {/* Arrival */}
                <div className="location-group end">
                  <div className={`time ${isDelayed && !isCancelled ? 'time-original' : ''}`}>
                    {flight.endTime}
                  </div>
                  {flight.endEstimatedTime && (
                    <div className="time-estimated">
                      Est. {flight.endEstimatedTime}
                    </div>
                  )}
                  <div className="location">{flight.endLocation}</div>
                  <div className="timezone">{flight.endDate}</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
