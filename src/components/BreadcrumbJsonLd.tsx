import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { type SupportedLanguage } from '@/i18n';

const BASE_URL = 'https://ekip-trade.com';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

const BreadcrumbJsonLd = ({ items }: BreadcrumbJsonLdProps) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'EkipTrade',
        item: `${BASE_URL}/${currentLang}`,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        ...(item.path && { item: `${BASE_URL}/${currentLang}/${item.path}` }),
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      data-jsonld="breadcrumb"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
};

export default BreadcrumbJsonLd;
