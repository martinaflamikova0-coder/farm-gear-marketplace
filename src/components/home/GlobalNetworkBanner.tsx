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
    <section className="py-6 md:py-10">
      <div className="container-custom">
        <Link 
          to={`/${currentLang}/${contactSlug}`}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.005] group"
        >
          <div className="relative overflow-hidden">
            <img
              src={globalNetwork}
              alt="Trusted Global Network - Connect with certified sellers from 50+ countries"
              className="w-full h-auto object-cover max-h-[200px] md:max-h-[280px] lg:max-h-[350px] transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default GlobalNetworkBanner;
