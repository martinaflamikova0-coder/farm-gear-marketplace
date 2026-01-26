import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import globalNetwork from '@/assets/banners/global-network.jpeg';

const GlobalNetworkBanner = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const contactSlug = getLocalizedSlug('contact', currentLang);

  return (
    <section className="py-8 md:py-12">
      <div className="container-custom">
        <Link 
          to={`/${currentLang}/${contactSlug}`}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] group"
        >
          <div className="relative">
            <img
              src={globalNetwork}
              alt="Trusted Global Network - Connect with certified sellers from 50+ countries"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default GlobalNetworkBanner;
