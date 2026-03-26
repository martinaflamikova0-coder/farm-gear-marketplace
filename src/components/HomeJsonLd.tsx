import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const BASE_URL = 'https://ekip-trade.com';

const HomeJsonLd = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GeoItalyAgro',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    description: t('seo.home.description'),
    sameAs: [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Vittorio Veneto 118',
      addressLocality: 'Oleggio Castello',
      postalCode: '28040',
      addressRegion: 'Piemonte',
      addressCountry: 'IT',
    },
    vatID: 'IT10992060011',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+39-377-389-0872',
      email: 'infos@ekip-trade.com',
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
