import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const BASE_URL = 'https://ekiptrade.com';

const HomeJsonLd = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EkipTrade',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    description: t('seo.home.description'),
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French', 'English', 'German', 'Spanish', 'Italian', 'Portuguese'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EkipTrade',
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
