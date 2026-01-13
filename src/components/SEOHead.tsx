import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  titleKey: string;
  descriptionKey: string;
}

const SEOHead = ({ titleKey, descriptionKey }: SEOHeadProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Set document title
    document.title = `${t(titleKey)} | EquipTrade`;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', t(descriptionKey));

    // Set Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${t(titleKey)} | EquipTrade`);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', t(descriptionKey));
  }, [t, titleKey, descriptionKey]);

  return null;
};

export default SEOHead;
