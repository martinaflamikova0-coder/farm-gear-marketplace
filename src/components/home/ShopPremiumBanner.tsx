import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import shopPremium from '@/assets/banners/shop-premium.jpeg';

const ShopPremiumBanner = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  return (
    <section className="py-8 md:py-12 bg-card">
      <div className="container-custom">
        <Link 
          to={`/${currentLang}/${listingsSlug}`}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] group"
        >
          <div className="relative">
            <img
              src={shopPremium}
              alt="Shop Premium Used - Tractors, Combines, Excavators & Loaders"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default ShopPremiumBanner;
