import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import fastDeals from '@/assets/banners/fast-deals.jpeg';

const FastDealsBanner = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const howItWorksSlug = getLocalizedSlug('how-it-works', currentLang);

  return (
    <section className="py-6 md:py-10 bg-secondary/30">
      <div className="container-custom">
        <Link 
          to={`/${currentLang}/${howItWorksSlug}`}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.005] group"
        >
          <div className="relative overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={fastDeals}
              alt="Deal Done in Days, Not Months - Smart matching technology"
              className="w-full h-auto object-contain max-h-[180px] md:max-h-[250px] lg:max-h-[320px] transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default FastDealsBanner;
