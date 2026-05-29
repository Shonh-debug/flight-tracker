'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { useLanguage } from '@/components/LanguageContext';
import { languageMeta, type Locale } from '@/locales';

const SETTINGS_KEY = 'flight_tracker_settings';

type SettingsState = {
  distanceUnit: 'km' | 'miles';
  altitudeUnit: 'meters' | 'feet';
  themeAccent: 'sky' | 'emerald' | 'amber';
  language: Locale;
};

const defaultSettings: SettingsState = {
  distanceUnit: 'miles',
  altitudeUnit: 'feet',
  themeAccent: 'sky',
  language: 'en',
};

export default function SettingsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isClient, setIsClient] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { locale, setLanguage, t } = useLanguage();

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

  // Sync language from context
  useEffect(() => {
    if (isClient) {
      setSettings((prev) => ({ ...prev, language: locale }));
    }
  }, [locale, isClient]);

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

    if (key === 'language') {
      setLanguage(value as Locale);
    }
    
    // Show toast
    setToastMessage(t.settings.saved);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const tabs = [
    { 
      id: 'general', 
      label: t.settings.general, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
    { 
      id: 'appearance', 
      label: t.settings.appearance, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> 
    },
    { 
      id: 'language', 
      label: t.settings.language, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> 
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
        <h1 className="text-2xl font-bold text-dash-text mb-1">{t.settings.title}</h1>
        <p className="text-dash-muted text-sm mb-6">
          {t.settings.subtitle}
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
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-50 text-theme-600'
                  : 'text-dash-muted hover:bg-slate-50 hover:text-dash-text'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'general' && isClient && (
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-dash-border bg-slate-50/50">
                <h3 className="text-base font-semibold text-dash-text">{t.settings.generalTitle}</h3>
                <p className="text-sm text-dash-muted mt-1">{t.settings.generalSubtitle}</p>
              </div>
              <div className="divide-y divide-dash-border">
                {/* Distance Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-dash-text">{t.settings.distanceUnit}</div>
                    <div className="text-sm text-dash-muted mt-0.5">{t.settings.distanceDesc}</div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateSetting('distanceUnit', 'km')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'km' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>{t.settings.kilometers}</button>
                    <button onClick={() => updateSetting('distanceUnit', 'miles')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'miles' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>{t.settings.miles}</button>
                  </div>
                </div>
                {/* Altitude Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-dash-text">{t.settings.altitudeUnit}</div>
                    <div className="text-sm text-dash-muted mt-0.5">{t.settings.altitudeDesc}</div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateSetting('altitudeUnit', 'meters')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'meters' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>{t.settings.meters}</button>
                    <button onClick={() => updateSetting('altitudeUnit', 'feet')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'feet' ? 'bg-white text-theme-600 shadow-sm' : 'text-dash-muted hover:text-dash-text'}`}>{t.settings.feet}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && isClient && (
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-dash-border bg-slate-50/50">
                <h3 className="text-base font-semibold text-dash-text">{t.settings.themeTitle}</h3>
                <p className="text-sm text-dash-muted mt-1">{t.settings.themeSubtitle}</p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'sky', name: t.settings.skyBlue, color: 'bg-sky-500' },
                    { id: 'emerald', name: t.settings.atcEmerald, color: 'bg-emerald-500' },
                    { id: 'amber', name: t.settings.radarAmber, color: 'bg-amber-500' },
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

          {activeTab === 'language' && isClient && (
            <div className="bg-white rounded-xl border border-dash-border overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-dash-border bg-slate-50/50">
                <h3 className="text-base font-semibold text-dash-text">{t.settings.languageTitle}</h3>
                <p className="text-sm text-dash-muted mt-1">{t.settings.languageSubtitle}</p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {languageMeta.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSetting('language', lang.code)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        settings.language === lang.code
                          ? 'border-theme-500 bg-theme-50/50 shadow-sm'
                          : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-3xl flex-shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-dash-text">{lang.nativeName}</div>
                        <div className="text-xs text-dash-muted">{lang.englishName}</div>
                      </div>
                      {settings.language === lang.code && (
                        <svg className="w-5 h-5 text-theme-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
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
