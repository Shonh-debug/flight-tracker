'use client';

import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function AlertsPage() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={() => {}}
      loading={false}
    >
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-dash-text mb-1">Alerts</h1>
        <p className="text-dash-muted text-sm mb-6">
          Stay updated with real-time flight alerts and notifications.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-dash-border p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dash-text mb-2">No Active Alerts</h3>
        <p className="text-dash-muted text-sm max-w-sm mx-auto">
          When you track flights, any delays, cancellations, or gate changes will appear here as real-time alerts.
        </p>
      </div>

      {/* Sample alert cards for visual demonstration */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="bg-white rounded-xl border border-dash-border p-4 flex items-start gap-4 opacity-50">
          <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 animate-pulse-dot" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-dash-text">AA123 — Delay Alert</span>
              <span className="text-xs text-dash-muted">Example</span>
            </div>
            <p className="text-xs text-dash-muted mt-1">Flight AA123 departure delayed by 45 minutes due to weather conditions.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-dash-border p-4 flex items-start gap-4 opacity-50">
          <div className="w-2 h-2 rounded-full bg-red-400 mt-2 animate-pulse-dot" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-dash-text">UA456 — Gate Change</span>
              <span className="text-xs text-dash-muted">Example</span>
            </div>
            <p className="text-xs text-dash-muted mt-1">Gate changed from B12 to C24 at JFK International.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
