import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import verifiedQuality from '@/assets/banners/verified-quality.jpeg';

const VerifiedQualityBanner = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const aboutSlug = getLocalizedSlug('about', currentLang);

  return (
    <section className="py-8 md:py-12">
      <div className="container-custom">
        <Link 
          to={`/${currentLang}/${aboutSlug}`}
          className="block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] group"
        >
          <div className="relative">
            <img
              src={verifiedQuality}
              alt="Verified Quality Equipment - Every machine inspected and certified"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default VerifiedQualityBanner;
