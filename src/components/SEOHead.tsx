import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

interface SEOHeadProps {
  titleKey: string;
  descriptionKey: string;
  // Keywords key from i18n (e.g. "seo.home.keywords")
  keywordsKey?: string;
  // For dynamic content (like product pages)
  dynamicTitle?: string;
  dynamicDescription?: string;
  dynamicKeywords?: string;
  // Optional image for Open Graph
  ogImage?: string;
  // Page type for structured data
  pageType?: 'website' | 'article' | 'product';
  // Product-specific data for Google Merchant Center
  productData?: {
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock' | 'preorder';
    condition?: 'new' | 'used' | 'refurbished';
    brand?: string;
    sku?: string;
    category?: string;
  };
}

// Base URL for canonical and hreflang - use production domain
const BASE_URL = 'https://geoitalyagro.com';

const SEOHead = ({ 
  titleKey, 
  descriptionKey,
  keywordsKey,
  dynamicTitle,
  dynamicDescription,
  dynamicKeywords,
  ogImage = 'https://storage.googleapis.com/gpt-engineer-file-uploads/0sb04V8FYeeMY4UlB4rvr37FtHo2/social-images/social-1773316728088-IMG_3297.webp',
  pageType = 'website',
  productData
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  useEffect(() => {
    const title = dynamicTitle || t(titleKey);
    const description = dynamicDescription || t(descriptionKey);
    const keywords = dynamicKeywords || (keywordsKey ? t(keywordsKey) : '');
    const fullTitle = `${title} | GeoItalyAgro`;

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

    // Set meta keywords
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', keywords, { name: 'keywords' });
    }

    // Set robots meta - allow indexing
    setMetaTag('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', { name: 'robots' });

    // Set Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle, { property: 'og:title' });
    setMetaTag('meta[property="og:description"]', 'content', description, { property: 'og:description' });
    setMetaTag('meta[property="og:type"]', 'content', pageType, { property: 'og:type' });
    setMetaTag('meta[property="og:url"]', 'content', `${BASE_URL}${location.pathname}`, { property: 'og:url' });
    setMetaTag('meta[property="og:image"]', 'content', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`, { property: 'og:image' });
    setMetaTag('meta[property="og:locale"]', 'content', getLocale(currentLang), { property: 'og:locale' });
    setMetaTag('meta[property="og:site_name"]', 'content', 'GeoItalyAgro', { property: 'og:site_name' });

    // Set Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', { name: 'twitter:card' });
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle, { name: 'twitter:title' });
    setMetaTag('meta[name="twitter:description"]', 'content', description, { name: 'twitter:description' });
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`, { name: 'twitter:image' });

    // Product-specific meta tags for Google Merchant Center
    if (pageType === 'product' && productData) {
      // Open Graph Product tags
      if (productData.price) {
        setMetaTag('meta[property="product:price:amount"]', 'content', productData.price.toFixed(2), { property: 'product:price:amount' });
        setMetaTag('meta[property="product:price:currency"]', 'content', productData.currency || 'EUR', { property: 'product:price:currency' });
      }
      if (productData.availability) {
        setMetaTag('meta[property="product:availability"]', 'content', productData.availability, { property: 'product:availability' });
      }
      if (productData.condition) {
        setMetaTag('meta[property="product:condition"]', 'content', productData.condition, { property: 'product:condition' });
      }
      if (productData.brand) {
        setMetaTag('meta[property="product:brand"]', 'content', productData.brand, { property: 'product:brand' });
      }
      if (productData.sku) {
        setMetaTag('meta[property="product:retailer_item_id"]', 'content', productData.sku, { property: 'product:retailer_item_id' });
      }
      if (productData.category) {
        setMetaTag('meta[property="product:category"]', 'content', productData.category, { property: 'product:category' });
      }
    }

    // Set canonical URL
    const canonicalPath = location.pathname;
    setLinkTag('canonical', `${BASE_URL}${canonicalPath}`);

    // Set hreflang tags for all supported languages
    SUPPORTED_LANGUAGES.forEach(langCode => {
      const localizedPath = getLocalizedPath(canonicalPath, langCode, currentLang);
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', langCode);
      link.setAttribute('href', `${BASE_URL}${localizedPath}`);
      document.head.appendChild(link);
    });

    // Add x-default hreflang (usually points to default language or language selector)
    const xDefaultLink = document.createElement('link');
    xDefaultLink.setAttribute('rel', 'alternate');
    xDefaultLink.setAttribute('hreflang', 'x-default');
    xDefaultLink.setAttribute('href', `${BASE_URL}${getLocalizedPath(canonicalPath, 'en', currentLang)}`);
    document.head.appendChild(xDefaultLink);

  }, [t, titleKey, descriptionKey, keywordsKey, dynamicTitle, dynamicDescription, dynamicKeywords, location.pathname, currentLang, ogImage, pageType, productData]);

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

// Localized slugs mapping for hreflang generation
const SLUG_MAPPINGS: Record<string, Record<SupportedLanguage, string>> = {
  'listing': { en: 'listing', fr: 'annonce', de: 'anzeige', es: 'anuncio', it: 'annuncio', pt: 'anuncio' },
  'listings': { en: 'listings', fr: 'annonces', de: 'anzeigen', es: 'anuncios', it: 'annunci', pt: 'anuncios' },
};

// Helper to get localized path for hreflang
const getLocalizedPath = (path: string, targetLang: SupportedLanguage, currentLang: SupportedLanguage): string => {
  // Remove current language prefix if exists
  let pathWithoutLang = path.replace(new RegExp(`^/${currentLang}(/|$)`), '/');
  
  // Handle root path
  if (pathWithoutLang === '/' || pathWithoutLang === '') {
    return `/${targetLang}`;
  }

  // Replace localized slugs
  Object.entries(SLUG_MAPPINGS).forEach(([, langMap]) => {
    const currentSlug = langMap[currentLang];
    const targetSlug = langMap[targetLang];
    if (currentSlug && targetSlug) {
      pathWithoutLang = pathWithoutLang.replace(
        new RegExp(`/${currentSlug}(/|$)`), 
        `/${targetSlug}$1`
      );
    }
  });
  
  // Add target language prefix
  return `/${targetLang}${pathWithoutLang}`;
};

export default SEOHead;
