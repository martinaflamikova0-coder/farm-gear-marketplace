import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Shield, TrendingUp, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import heroBg from '@/assets/hero-bg.jpg';

const HeroBanner = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'it') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const stats = [
    { icon: TrendingUp, value: '995+', labelKey: 'hero.activeListings' },
    { icon: Shield, value: '100%', labelKey: 'hero.verifiedListings' },
    { icon: Truck, value: '200+', labelKey: 'hero.partnerSellers' },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(145_45%_12%/0.92)] via-[hsl(145_40%_18%/0.88)] to-[hsl(150_35%_10%/0.94)]" />

      {/* Subtle golden accent glow */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,hsl(40_60%_50%/0.08),transparent_70%)]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container-custom relative py-14 md:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Headline */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-white tracking-tight drop-shadow-lg">
              {t('hero.title')}{' '}
              <motion.span
                className="text-accent inline-block drop-shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              >
                {t('hero.titleAccent')}
              </motion.span>
            </h1>
            <motion.p
              className="text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero.subtitle')}
            </motion.p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          >
            <Button
              variant="default"
              size="lg"
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl hover:shadow-[0_20px_60px_-10px_hsl(25_95%_53%/0.4)] transition-all duration-300 hover:scale-[1.03] text-base px-8 py-6 rounded-xl"
            >
              <Link to={`/${currentLang}/${listingsSlug}`} className="flex items-center gap-2.5">
                {t('common.browseListings')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-10 pt-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1.5 backdrop-blur-sm bg-white/5 rounded-xl py-3 px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
              >
                <stat.icon className="h-5 w-5 text-accent mb-1 hidden sm:block" />
                <span className="font-display text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm text-white/50 leading-tight text-center">
                  {t(stat.labelKey)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L80 72C160 64 320 48 480 42C640 36 800 40 960 46C1120 52 1280 60 1360 64L1440 68V80H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroBanner;
