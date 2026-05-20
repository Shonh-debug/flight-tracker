'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

const SETTINGS_KEY = 'flight_tracker_settings';

type SettingsState = {
  distanceUnit: 'km' | 'miles';
  altitudeUnit: 'meters' | 'feet';
  themeAccent: 'sky' | 'emerald' | 'amber';
};

const defaultSettings: SettingsState = {
  distanceUnit: 'miles',
  altitudeUnit: 'feet',
  themeAccent: 'sky',
};

export default function SettingsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isClient, setIsClient] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    if (key === 'themeAccent') {
      if (value === 'sky') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', value as string);
      }
    }
    
    // Show toast
    setToastMessage('Setting saved');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      disabled: true,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> 
    },
    { 
      id: 'api', 
      label: 'API & Data', 
      disabled: true,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> 
    },
  ];

  return (
    <DashboardShell
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={() => {}}
      loading={false}
    >
      <div className="animate-fade-in relative">
        <h1 className="text-2xl font-bold text-dash-text mb-1">Settings</h1>
        <p className="text-dash-muted text-sm mb-6">
          Manage your preferences, display settings, and API configurations.
        </p>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Vertical Tab Navigation */}
        <div className="w-full md:w-64 space-y-1 bg-white p-2 rounded-xl border border-dash-border flex-shrink-0 animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-50 text-theme-600'
                  : tab.disabled
                  ? 'opacity-50 cursor-not-allowed text-dash-muted'
                  : 'text-dash-muted hover:bg-slate-50 hover:text-dash-text'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.disabled && (
                <span className="ml-auto text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'general' && isClient && (
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-dash-border bg-slate-50/50">
                <h3 className="text-base font-semibold text-dash-text">General Preferences</h3>
                <p className="text-sm text-dash-muted mt-1">Configure units and timezone logic for all flight data.</p>
              </div>
              <div className="divide-y divide-dash-border">
                {/* Distance Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-dash-text">Distance Unit</div>
                    <div className="text-sm text-dash-muted mt-0.5">Used for flight paths and range</div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateSetting('distanceUnit', 'km')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'km' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>Kilometers</button>
                    <button onClick={() => updateSetting('distanceUnit', 'miles')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'miles' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>Miles</button>
                  </div>
                </div>
                {/* Altitude Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-dash-text">Altitude Unit</div>
                    <div className="text-sm text-dash-muted mt-0.5">Used for live flight altitude tracking</div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateSetting('altitudeUnit', 'meters')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'meters' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>Meters</button>
                    <button onClick={() => updateSetting('altitudeUnit', 'feet')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'feet' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>Feet</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && isClient && (
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-dash-border bg-slate-50/50">
                <h3 className="text-base font-semibold text-dash-text">Theme Accents</h3>
                <p className="text-sm text-dash-muted mt-1">Personalize the look and feel of your command center.</p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'sky', name: 'Sky Blue', color: 'bg-sky-500' },
                    { id: 'emerald', name: 'ATC Emerald', color: 'bg-emerald-500' },
                    { id: 'amber', name: 'Radar Amber', color: 'bg-amber-500' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting('themeAccent', theme.id as any)}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${settings.themeAccent === theme.id ? 'border-theme-500 bg-slate-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <div className={`w-12 h-12 rounded-full ${theme.color} mb-3 shadow-sm ring-4 ring-white`} />
                      <span className="text-sm font-medium text-dash-text">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
