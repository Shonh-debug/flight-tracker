import en from './en';
import ru from './ru';
import fr from './fr';
import de from './de';
import zh from './zh';
import vi from './vi';
import type { TranslationKeys } from './en';

export type Locale = 'en' | 'ru' | 'fr' | 'de' | 'zh' | 'vi';

export const locales: Record<Locale, TranslationKeys> = {
  en,
  ru,
  fr,
  de,
  zh,
  vi,
};

export const languageMeta: { code: Locale; flag: string; nativeName: string; englishName: string }[] = [
  { code: 'en', flag: '🇺🇸', nativeName: 'English',     englishName: 'English' },
  { code: 'ru', flag: '🇷🇺', nativeName: 'Русский',     englishName: 'Russian' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français',    englishName: 'French' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch',     englishName: 'German' },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文',         englishName: 'Chinese' },
  { code: 'vi', flag: '🇻🇳', nativeName: 'Tiếng Việt',  englishName: 'Vietnamese' },
];

export type { TranslationKeys };
export default locales;
