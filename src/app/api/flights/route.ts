import { NextResponse } from 'next/server';

export type Flight = {
  id: string;
  flightNumber: string;
  startTime: string;
  endTime: string;
  startTimeZone: string;
  endTimeZone: string;
  startLocation: string;
  endLocation: string;
  status: string;
};

// Helper to format date strings beautifully
function formatTime(dateString: string | null) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return "N/A";
  }
}

// Force the route to be dynamic so it never caches outdated real-time data
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');

  if (!flightNumber) {
    return NextResponse.json({ flights: [] });
  }

  const apiKey = process.env.AVIATION_STACK_API_KEY;
  if (!apiKey) {
    console.error("Missing AVIATION_STACK_API_KEY");
    // Return empty results or perhaps a 500 status. Returning empty gracefully is better for UI.
    return NextResponse.json(
      { error: "API key is missing. Please set AVIATION_STACK_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    // We use http since free tier of Aviation Stack uses HTTP.
    const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Aviation Stack API error: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !data.data || !Array.isArray(data.data)) {
       return NextResponse.json({ flights: [] });
    }

    const results: Flight[] = data.data.map((f: any) => ({
      id: `${f.flight.iata}-${f.flight_date}-${Math.random().toString(36).substring(7)}`,
      flightNumber: f.flight.iata || flightNumber,
      startTime: formatTime(f.departure.scheduled),
      endTime: formatTime(f.arrival.scheduled),
      startTimeZone: f.departure.timezone || "N/A",
      endTimeZone: f.arrival.timezone || "N/A",
      startLocation: f.departure.airport || f.departure.iata || "Unknown",
      endLocation: f.arrival.airport || f.arrival.iata || "Unknown",
      status: f.flight_status === 'active' ? 'Active' : 
              f.flight_status === 'scheduled' ? 'Scheduled' : 
              f.flight_status === 'landed' ? 'Landed' : 
              f.flight_status === 'cancelled' ? 'Cancelled' : 
              f.flight_status === 'incident' ? 'Incident' : 
              f.flight_status === 'diverted' ? 'Diverted' : 'Unknown'
    }));

    return NextResponse.json({ flights: results });
  } catch (error: any) {
    console.error("Failed to fetch flight data:", error);
    return NextResponse.json({ flights: [] }, { status: 500 });
  }
}
