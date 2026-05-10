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

const mockFlights: Flight[] = [
  {
    id: "1",
    flightNumber: "AA123",
    startTime: "08:30 AM",
    endTime: "11:45 AM",
    startTimeZone: "EST",
    endTimeZone: "PST",
    startLocation: "JFK - New York",
    endLocation: "LAX - Los Angeles",
    status: "On Time"
  },
  {
    id: "2",
    flightNumber: "DL456",
    startTime: "02:15 PM",
    endTime: "04:30 PM",
    startTimeZone: "EST",
    endTimeZone: "CST",
    startLocation: "BOS - Boston",
    endLocation: "ORD - Chicago",
    status: "Delayed"
  },
  {
    id: "3",
    flightNumber: "UA789",
    startTime: "06:00 PM",
    endTime: "10:30 PM",
    startTimeZone: "PST",
    endTimeZone: "HST",
    startLocation: "SFO - San Francisco",
    endLocation: "HNL - Honolulu",
    status: "On Time"
  },
  {
    id: "4",
    flightNumber: "AA123",
    startTime: "07:00 PM",
    endTime: "10:15 PM",
    startTimeZone: "EST",
    endTimeZone: "PST",
    startLocation: "MIA - Miami",
    endLocation: "SEA - Seattle",
    status: "On Time"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');

  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

  if (!flightNumber) {
    return NextResponse.json({ flights: [] });
  }

  const results = mockFlights.filter(f => 
    f.flightNumber.toLowerCase() === flightNumber.toLowerCase()
  );

  return NextResponse.json({ flights: results });
}
