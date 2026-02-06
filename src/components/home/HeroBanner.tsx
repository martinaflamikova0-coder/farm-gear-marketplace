import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import heroEquipment from '@/assets/banners/hero-equipment.jpeg';

const HeroBanner = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container-custom py-4 md:py-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-muted w-full">
            <img
              src={heroEquipment}
              alt={t('hero.bannerAlt')}
              className="w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[450px] object-cover object-[center_30%]"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          {/* Overlay gradient for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
          
          {/* CTA Button overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center md:bottom-8">
            <Button 
              variant="default" 
              size="lg" 
              asChild
              className="shadow-xl hover:scale-105 transition-transform animate-pulse-gentle"
            >
              <Link to={`/${currentLang}/${listingsSlug}`} className="flex items-center gap-2">
                {t('common.browseListings')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
