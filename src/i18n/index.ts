import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'pt'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português'
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  it: '🇮🇹',
  pt: '🇵🇹'
};

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      cookieMinutes: 525600 // 1 year
    }
  });

export default i18n;

// Helper to get language from URL path
export const getLanguageFromPath = (pathname: string): SupportedLanguage | null => {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as SupportedLanguage)) {
    return match[1] as SupportedLanguage;
  }
  return null;
};

// Helper to build localized path
export const getLocalizedPath = (path: string, lang: SupportedLanguage): string => {
  // Remove existing language prefix if present
  const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
};

// Route slugs for SEO-friendly URLs
export const ROUTE_SLUGS: Record<string, Record<SupportedLanguage, string>> = {
  listings: {
    en: 'listings',
    fr: 'annonces',
    de: 'anzeigen',
    es: 'anuncios',
    it: 'annunci',
    pt: 'anuncios'
  },
  listing: {
    en: 'listing',
    fr: 'annonce',
    de: 'anzeige',
    es: 'anuncio',
    it: 'annuncio',
    pt: 'anuncio'
  }
};

export const getLocalizedSlug = (key: string, lang: SupportedLanguage): string => {
  return ROUTE_SLUGS[key]?.[lang] || key;
};
