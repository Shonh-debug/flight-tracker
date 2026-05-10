'use client';

import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function SettingsPage() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={() => {}}
      loading={false}
    >
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-dash-text mb-1">Settings</h1>
        <p className="text-dash-muted text-sm mb-6">
          Manage your preferences and account settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Preferences Section */}
        <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up">
          <div className="px-5 py-4 border-b border-dash-border">
            <h3 className="text-base font-semibold text-dash-text">Preferences</h3>
          </div>
          <div className="divide-y divide-dash-border">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dash-text">Time Format</div>
                <div className="text-xs text-dash-muted mt-0.5">Choose between 12-hour and 24-hour format</div>
              </div>
              <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-700">
                24h
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dash-text">Default Airport</div>
                <div className="text-xs text-dash-muted mt-0.5">Set your home airport for quick access</div>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border border-dash-border rounded-lg text-xs font-medium text-dash-muted">
                Not set
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dash-text">Push Notifications</div>
                <div className="text-xs text-dash-muted mt-0.5">Receive alerts for tracked flights</div>
              </div>
              <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* API Section */}
        <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '75ms', animationFillMode: 'both' }}>
          <div className="px-5 py-4 border-b border-dash-border">
            <h3 className="text-base font-semibold text-dash-text">API Configuration</h3>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-dash-text">Aviation Stack API</div>
                <div className="text-xs text-dash-muted mt-0.5">Status of your API connection</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="text-xs font-medium text-emerald-600">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <div className="px-5 py-4 border-b border-dash-border">
            <h3 className="text-base font-semibold text-dash-text">About</h3>
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dash-muted">Version</span>
              <span className="font-mono text-dash-text">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dash-muted">Framework</span>
              <span className="font-mono text-dash-text">Next.js 16</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dash-muted">Styling</span>
              <span className="font-mono text-dash-text">Tailwind CSS v3</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
