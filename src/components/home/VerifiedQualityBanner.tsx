import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import verifiedQuality from '@/assets/banners/verified-quality.jpeg';

const VerifiedQualityBanner = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const aboutSlug = getLocalizedSlug('about', currentLang);

  return (
    <section className="py-6 md:py-10">
      <Link 
        to={`/${currentLang}/${aboutSlug}`}
        className="block overflow-hidden hover:opacity-95 transition-opacity duration-300 group"
      >
        <div className="relative overflow-hidden bg-muted">
          <img
            src={verifiedQuality}
            alt={t('banners.verifiedQualityAlt')}
            className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </Link>
    </section>
  );
};

export default VerifiedQualityBanner;
