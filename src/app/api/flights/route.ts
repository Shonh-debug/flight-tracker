import { NextResponse } from 'next/server';

export type Flight = {
  id: string;
  flightNumber: string;
  airlineName: string;
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
  startIata: string;
  endIata: string;
  startTerminal: string | null;
  endTerminal: string | null;
  startGate: string | null;
  endGate: string | null;
  status: string;
  departureDelay: number | null;
  arrivalDelay: number | null;
  flightDate: string;
  rawDeparture: string;
  rawArrival: string;
};

// Known flight distances (in km) from real-world data to override inaccurate mock data
const KNOWN_DISTANCES: Record<string, number> = {
  'CI31': 9614,
  'AC228': 687,
  'KHV850': 1090,
  'K6850': 1090,
  'AA123': 6080,
  'UA456': 1249,
};

// Helper to get timezone abbreviation (e.g., "PDT", "MDT") from an IANA timezone
function getTimezoneAbbr(timeZone: string | null): string {
  if (!timeZone) return "";
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? ` ${tzPart.value}` : "";
  } catch {
    return "";
  }
}

// Extract HH:MM directly from an ISO timestamp string
function formatTime(dateString: string | null, timeZone: string | null): string | null {
  if (!dateString) return null;
  try {
    const match = dateString.match(/T(\d{2}):(\d{2})/);
    if (!match) return null;
    const tzAbbr = getTimezoneAbbr(timeZone);
    return `${match[1]}:${match[2]}${tzAbbr}`;
  } catch {
    return null;
  }
}

// Extract YYYY-MM-DD directly from an ISO timestamp string and format as "Wed, May 10"
function formatDate(dateString: string | null, _timeZone: string | null) {
  if (!dateString) return "N/A";
  try {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return "N/A";
    const d = new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
      12, 0, 0
    );
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return "N/A";
  }
}

// Force the route to be dynamic so it never caches outdated real-time data
export const dynamic = 'force-dynamic';

// ─── In-memory sliding window rate limiter ───
const RATE_LIMIT = 20;          // max requests per window
const RATE_WINDOW_MS = 60_000;  // 60 seconds

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Periodically clean up stale entries to avoid memory leaks (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

function getRateLimitInfo(ip: string): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { limited: false, remaining: RATE_LIMIT - 1, resetTime: now + RATE_WINDOW_MS };
  }

  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  return { limited: entry.count > RATE_LIMIT, remaining, resetTime: entry.resetTime };
}

export async function GET(request: Request) {
  // ── Rate limiting ──
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const { limited, remaining, resetTime } = getRateLimitInfo(ip);

  if (limited) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');

  if (!flightNumber) {
    return NextResponse.json({ flights: [] });
  }

  // ── Input validation ──
  const cleanNumber = flightNumber.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9]{2,10}$/.test(cleanNumber)) {
    return NextResponse.json(
      { error: 'Invalid flight number format. Use 2-10 alphanumeric characters (e.g. AA123).' },
      { status: 400 }
    );
  }

  const apiKey = process.env.AVIATION_STACK_API_KEY;
  if (!apiKey) {
    console.error("Missing AVIATION_STACK_API_KEY");
    return NextResponse.json(
      { error: "Flight data is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    // Determine if the input is an ICAO code (3 letters followed by numbers) or IATA code.
    const isIcao = /^[A-Za-z]{3}\d+$/.test(cleanNumber);
    const queryParam = isIcao ? 'flight_icao' : 'flight_iata';

    const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&${queryParam}=${encodeURIComponent(cleanNumber)}&limit=100`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Aviation Stack API error: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !data.data || !Array.isArray(data.data)) {
      return NextResponse.json({ flights: [] });
    }

    const results: Flight[] = data.data.map((f: any, idx: number) => {
      // Calculate delay ourselves by comparing estimated vs. scheduled ISO timestamps
      // Positive = late, negative = early, null = no estimate available
      function computeDelay(scheduled: string | null, estimated: string | null): number | null {
        if (!scheduled || !estimated) return null;
        try {
          const schedMs = new Date(scheduled).getTime();
          const estMs = new Date(estimated).getTime();
          if (isNaN(schedMs) || isNaN(estMs)) return null;
          const diffMin = Math.round((estMs - schedMs) / 60000);
          return diffMin === 0 ? null : diffMin;
        } catch {
          return null;
        }
      }

      const depDelay = computeDelay(f.departure.scheduled, f.departure.estimated);
      const arrDelay = computeDelay(f.arrival.scheduled, f.arrival.estimated);

      // Only show estimated time if it meaningfully differs from scheduled
      const scheduledDep = formatTime(f.departure.scheduled, f.departure.timezone);
      const estimatedDep = formatTime(f.departure.estimated, f.departure.timezone);
      const scheduledArr = formatTime(f.arrival.scheduled, f.arrival.timezone);
      const estimatedArr = formatTime(f.arrival.estimated, f.arrival.timezone);

      const startEstimatedTime = estimatedDep !== scheduledDep ? estimatedDep : null;
      const endEstimatedTime = estimatedArr !== scheduledArr ? estimatedArr : null;

      // Use a deterministic ID so we can look flights up by index later
      const flightIata = f.flight.iata || cleanNumber;
      
      // Extract or generate a consistent mock distance/altitude
      const knownDistance = KNOWN_DISTANCES[flightIata] || KNOWN_DISTANCES[cleanNumber];
      const flightDistanceKm = f.flight?.distance || knownDistance || (f.departure.iata && f.arrival.iata ? (f.departure.iata.charCodeAt(0) * f.arrival.iata.charCodeAt(0) * 17) % 8000 + 500 : 1500);
      const flightAltitudeM = f.live?.altitude || (f.flight_status === 'active' ? (flightDistanceKm > 2000 ? 10600 : 8500) : null);

      return {
        id: `${flightIata}-${f.flight_date}-${idx}`,
        flightNumber: flightIata,
        airlineName: f.airline?.name || "Unknown Airline",
        startTime: scheduledDep ?? "N/A",
        endTime: scheduledArr ?? "N/A",
        startEstimatedTime,
        endEstimatedTime,
        startDate: formatDate(f.departure.scheduled, f.departure.timezone),
        endDate: formatDate(f.arrival.scheduled, f.arrival.timezone),
        startTimeZone: f.departure.timezone || "N/A",
        endTimeZone: f.arrival.timezone || "N/A",
        startLocation: f.departure.airport || "Unknown",
        endLocation: f.arrival.airport || "Unknown",
        startIata: f.departure.iata || "",
        endIata: f.arrival.iata || "",
        startTerminal: f.departure.terminal || null,
        endTerminal: f.departure.terminal || null,
        startGate: f.departure.gate || null,
        endGate: f.arrival.gate || null,
        departureDelay: depDelay,
        arrivalDelay: arrDelay,
        flightDate: f.flight_date || "N/A",
        status: f.flight_status === 'active' ? 'Active' :
                f.flight_status === 'scheduled' ? 'Scheduled' :
                f.flight_status === 'landed' ? 'Landed' :
                f.flight_status === 'cancelled' ? 'Cancelled' :
                f.flight_status === 'incident' ? 'Incident' :
                f.flight_status === 'diverted' ? 'Diverted' : 'Unknown',
        rawDeparture: f.departure.scheduled || "",
        rawArrival: f.arrival.scheduled || "",
        distance: flightDistanceKm,
        altitude: flightAltitudeM,
      };
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredAndSortedResults = results
      .filter((f) => {
        if (!f.rawDeparture) return false;
        const depTime = new Date(f.rawDeparture);
        return depTime >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const timeA = a.rawDeparture ? new Date(a.rawDeparture).getTime() : 0;
        const timeB = b.rawDeparture ? new Date(b.rawDeparture).getTime() : 0;
        return timeB - timeA; // Descending
      });

    return NextResponse.json({ flights: filteredAndSortedResults });
  } catch (error: any) {
    console.error("Failed to fetch flight data:", error);
    return NextResponse.json({ flights: [] }, { status: 500 });
  }
}
