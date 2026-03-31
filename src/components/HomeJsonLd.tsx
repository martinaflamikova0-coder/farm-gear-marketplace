import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const BASE_URL = 'https://geoitalyagro.com';

const HomeJsonLd = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Geo Italy Agro',
    legalName: 'Geo Italy s.r.l.',
    alternateName: 'GeoItalyAgro',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    description: t('seo.home.description'),
    sameAs: [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Vicolo Santa Maria alla Porta 1',
      addressLocality: 'Milano',
      addressRegion: 'MI',
      postalCode: '20123',
      addressCountry: 'IT',
    },
    location: {
      '@type': 'Place',
      name: 'Sede Operativa',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via G. Abbate 151',
        addressLocality: 'Castagnole delle Lanze',
        postalCode: '14054',
        addressRegion: 'AT',
        addressCountry: 'IT',
      },
    },
    vatID: 'IT01540910054',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+39-0141-877368',
      email: 'info@geoitalyagro.com',
      contactType: 'customer service',
      availableLanguage: ['French', 'English', 'German', 'Spanish', 'Italian', 'Portuguese'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GeoItalyAgro',
    url: BASE_URL,
    description: t('seo.home.description'),
    inLanguage: currentLang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/{lang}/${listingsSlug}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
};

export default HomeJsonLd;
