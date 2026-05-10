'use client';

import type { Flight } from './FlightSearch';

type StatConfig = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
};

function getStats(flights: Flight[]): StatConfig[] {
  const total = flights.length;
  const active = flights.filter((f) => f.status === 'Active').length;
  const scheduled = flights.filter((f) => f.status === 'Scheduled').length;
  const landed = flights.filter((f) => f.status === 'Landed').length;
  const delayed = flights.filter(
    (f) => f.status === 'Delayed' || f.status === 'Cancelled' || f.status === 'Diverted'
  ).length;

  return [
    {
      label: 'Total Flights',
      value: total,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3.2-.8c-.4-.1-.8.2-1 .6L1 17l4 1.5L6.5 23l1.2-.8c.4-.3.7-.7.6-1.1L7.5 18l3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
        </svg>
      ),
    },
    {
      label: 'Active',
      value: active,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Landed',
      value: landed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'Delayed / Cancelled',
      value: delayed,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
  ];
}

export default function StatsCards({ flights }: { flights: Flight[] }) {
  const stats = getStats(flights);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`bg-white rounded-xl border ${stat.borderColor} p-4 md:p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-slide-up`}
          style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <div className={`text-3xl font-bold ${stat.color} mb-1 font-mono`}>
            {stat.value}
          </div>
          <div className="text-sm text-dash-muted font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
