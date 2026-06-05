'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { useLanguage } from '@/components/LanguageContext';
import { languageMeta, type Locale } from '@/locales';

const SETTINGS_KEY = 'flight_tracker_settings';

type SettingsState = {
  distanceUnit: 'km' | 'miles';
  altitudeUnit: 'meters' | 'feet';
  darkMode: boolean;
  language: Locale;
};

const defaultSettings: SettingsState = {
  distanceUnit: 'miles',
  altitudeUnit: 'feet',
  darkMode: true,
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
        const parsed = JSON.parse(stored);
        // Migration: if old themeAccent exists, convert to darkMode
        if ('themeAccent' in parsed && !('darkMode' in parsed)) {
          parsed.darkMode = true; // default to dark
          delete parsed.themeAccent;
        }
        setSettings({ ...defaultSettings, ...parsed });
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
    
    if (key === 'darkMode') {
      if (value === true) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{t.settings.title}</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          {t.settings.subtitle}
        </p>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-0 right-0 bg-[var(--accent)] text-[#0f172a] px-4 py-2 rounded-lg shadow-glow text-sm font-medium animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Vertical Tab Navigation */}
        <div className="w-full md:w-64 space-y-1 glass-card p-2 flex-shrink-0 animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'nav-active'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]'
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
            <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-[var(--border-glass)] bg-[var(--accent-muted)]">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t.settings.generalTitle}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t.settings.generalSubtitle}</p>
              </div>
              <div className="divide-y divide-[var(--border-glass)]">
                {/* Distance Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t.settings.distanceUnit}</div>
                    <div className="text-sm text-[var(--text-secondary)] mt-0.5">{t.settings.distanceDesc}</div>
                  </div>
                  <div className="flex p-1 rounded-lg" style={{ background: 'var(--accent-muted)' }}>
                    <button onClick={() => updateSetting('distanceUnit', 'km')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'km' ? 'bg-[var(--accent)] text-[#0f172a] shadow-glow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{t.settings.kilometers}</button>
                    <button onClick={() => updateSetting('distanceUnit', 'miles')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.distanceUnit === 'miles' ? 'bg-[var(--accent)] text-[#0f172a] shadow-glow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{t.settings.miles}</button>
                  </div>
                </div>
                {/* Altitude Unit */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t.settings.altitudeUnit}</div>
                    <div className="text-sm text-[var(--text-secondary)] mt-0.5">{t.settings.altitudeDesc}</div>
                  </div>
                  <div className="flex p-1 rounded-lg" style={{ background: 'var(--accent-muted)' }}>
                    <button onClick={() => updateSetting('altitudeUnit', 'meters')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'meters' ? 'bg-[var(--accent)] text-[#0f172a] shadow-glow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{t.settings.meters}</button>
                    <button onClick={() => updateSetting('altitudeUnit', 'feet')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.altitudeUnit === 'feet' ? 'bg-[var(--accent)] text-[#0f172a] shadow-glow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{t.settings.feet}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && isClient && (
            <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-[var(--border-glass)] bg-[var(--accent-muted)]">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t.settings.themeTitle}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t.settings.themeSubtitle}</p>
              </div>
              <div className="px-6 py-6">
                {/* Dark/Light Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Sun/Moon icons */}
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl transition-all ${settings.darkMode ? 'bg-[var(--accent-muted)] text-[var(--accent)] shadow-glow-sm' : 'text-[var(--text-secondary)]'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{settings.darkMode ? t.settings.darkMode : t.settings.lightMode}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{settings.darkMode ? t.settings.darkModeDesc : t.settings.lightModeDesc}</div>
                      </div>
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => updateSetting('darkMode', !settings.darkMode)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      settings.darkMode
                        ? 'bg-[var(--accent)] shadow-glow-sm'
                        : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={settings.darkMode}
                    aria-label="Toggle dark mode"
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 ${
                        settings.darkMode
                          ? 'left-7 bg-[#0f172a]'
                          : 'left-0.5 bg-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Preview cards */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateSetting('darkMode', true)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      settings.darkMode
                        ? 'border-[var(--accent)] shadow-glow-sm'
                        : 'border-[var(--border-glass)] hover:border-[var(--border-glow)]'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg bg-[#0a0e1a] border border-cyan-900/30 mb-3 flex items-center justify-center">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{t.settings.darkMode}</span>
                  </button>
                  <button
                    onClick={() => updateSetting('darkMode', false)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      !settings.darkMode
                        ? 'border-[var(--accent)] shadow-glow-sm'
                        : 'border-[var(--border-glass)] hover:border-[var(--border-glow)]'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg bg-[#f0f4f8] border border-slate-200 mb-3 flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{t.settings.lightMode}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && isClient && (
            <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <div className="px-6 py-5 border-b border-[var(--border-glass)] bg-[var(--accent-muted)]">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t.settings.languageTitle}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t.settings.languageSubtitle}</p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {languageMeta.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSetting('language', lang.code)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        settings.language === lang.code
                          ? 'border-[var(--accent)] bg-[var(--accent-muted)] shadow-glow-sm'
                          : 'border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glow)]'
                      }`}
                    >
                      <span className="text-3xl flex-shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{lang.nativeName}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{lang.englishName}</div>
                      </div>
                      {settings.language === lang.code && (
                        <svg className="w-5 h-5 text-[var(--accent)] ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
