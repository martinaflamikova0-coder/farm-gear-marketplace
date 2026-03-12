import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import shopPremium from '@/assets/banners/shop-premium.jpeg';

const ShopPremiumBanner = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  return (
    <section className="py-6 md:py-10 bg-card">
      <Link 
        to={`/${currentLang}/${listingsSlug}`}
        className="block overflow-hidden hover:opacity-95 transition-opacity duration-300 group"
      >
        <div className="relative overflow-hidden bg-muted">
          <img
            src={shopPremium}
            alt={t('banners.shopPremiumAlt')}
            className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </Link>
    </section>
  );
};

export default ShopPremiumBanner;
