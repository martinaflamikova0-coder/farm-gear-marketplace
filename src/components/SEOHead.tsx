import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

interface SEOHeadProps {
  titleKey: string;
  descriptionKey: string;
  // For dynamic content (like product pages)
  dynamicTitle?: string;
  dynamicDescription?: string;
  // Optional image for Open Graph
  ogImage?: string;
  // Page type for structured data
  pageType?: 'website' | 'article' | 'product';
}

const SEOHead = ({ 
  titleKey, 
  descriptionKey, 
  dynamicTitle,
  dynamicDescription,
  ogImage = '/og-image.jpg',
  pageType = 'website'
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  
  // Base URL - in production this should come from env
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://equiptrade.com';

  useEffect(() => {
    const title = dynamicTitle || t(titleKey);
    const description = dynamicDescription || t(descriptionKey);
    const fullTitle = `${title} | EquipTrade`;

    // Set document title
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (selector: string, attribute: string, value: string, createAttrs?: Record<string, string>) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (createAttrs) {
          Object.entries(createAttrs).forEach(([key, val]) => {
            tag!.setAttribute(key, val);
          });
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attribute, value);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        if (hreflang) {
          tag.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // Remove existing hreflang tags to prevent duplicates
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Set meta description
    setMetaTag('meta[name="description"]', 'content', description, { name: 'description' });

    // Set Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle, { property: 'og:title' });
    setMetaTag('meta[property="og:description"]', 'content', description, { property: 'og:description' });
    setMetaTag('meta[property="og:type"]', 'content', pageType, { property: 'og:type' });
    setMetaTag('meta[property="og:url"]', 'content', `${baseUrl}${location.pathname}`, { property: 'og:url' });
    setMetaTag('meta[property="og:image"]', 'content', ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`, { property: 'og:image' });
    setMetaTag('meta[property="og:locale"]', 'content', getLocale(currentLang), { property: 'og:locale' });
    setMetaTag('meta[property="og:site_name"]', 'content', 'EquipTrade', { property: 'og:site_name' });

    // Set Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', { name: 'twitter:card' });
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle, { name: 'twitter:title' });
    setMetaTag('meta[name="twitter:description"]', 'content', description, { name: 'twitter:description' });
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`, { name: 'twitter:image' });

    // Set canonical URL
    const canonicalPath = location.pathname;
    setLinkTag('canonical', `${baseUrl}${canonicalPath}`);

    // Set hreflang tags for all supported languages
    SUPPORTED_LANGUAGES.forEach(langCode => {
      const localizedPath = getLocalizedPath(canonicalPath, langCode, currentLang);
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', langCode);
      link.setAttribute('href', `${baseUrl}${localizedPath}`);
      document.head.appendChild(link);
    });

    // Add x-default hreflang (usually points to default language or language selector)
    const xDefaultLink = document.createElement('link');
    xDefaultLink.setAttribute('rel', 'alternate');
    xDefaultLink.setAttribute('hreflang', 'x-default');
    xDefaultLink.setAttribute('href', `${baseUrl}${getLocalizedPath(canonicalPath, 'en', currentLang)}`);
    document.head.appendChild(xDefaultLink);

  }, [t, titleKey, descriptionKey, dynamicTitle, dynamicDescription, location.pathname, currentLang, baseUrl, ogImage, pageType]);

  return null;
};

// Helper to get locale format for Open Graph
const getLocale = (lang: SupportedLanguage): string => {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en_GB',
    fr: 'fr_FR',
    de: 'de_DE',
    es: 'es_ES',
    it: 'it_IT',
    pt: 'pt_PT',
  };
  return localeMap[lang] || 'en_GB';
};

// Helper to get localized path for hreflang
const getLocalizedPath = (path: string, targetLang: SupportedLanguage, currentLang: SupportedLanguage): string => {
  // Remove current language prefix if exists
  const pathWithoutLang = path.replace(new RegExp(`^/${currentLang}(/|$)`), '/');
  
  // Handle root path
  if (pathWithoutLang === '/' || pathWithoutLang === '') {
    return `/${targetLang}`;
  }
  
  // Add target language prefix
  return `/${targetLang}${pathWithoutLang}`;
};

export default SEOHead;
