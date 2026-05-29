'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import locales, { type Locale, type TranslationKeys } from '@/locales';

const SETTINGS_KEY = 'flight_tracker_settings';

type LanguageContextType = {
  locale: Locale;
  setLanguage: (locale: Locale) => void;
  t: TranslationKeys;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLanguage: () => {},
  t: locales.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language && parsed.language in locales) {
          setLocale(parsed.language as Locale);
        }
      }
    } catch (e) {
      console.error('Failed to read language setting', e);
    }
  }, []);

  const setLanguage = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      settings.language = newLocale;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save language setting', e);
    }
  }, []);

  const t = locales[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
