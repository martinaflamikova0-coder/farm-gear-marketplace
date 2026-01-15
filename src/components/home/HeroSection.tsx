import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${currentLang}/${listingsSlug}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { icon: TrendingUp, value: '995+', label: t('hero.activeListings') },
    { icon: Shield, value: '100%', label: t('hero.verifiedListings') },
    { icon: Truck, value: '200+', label: t('hero.partnerSellers') },
  ];

  const popularSearches = ['John Deere', 'Tracteur 2020', 'Moissonneuse Claas', 'Manitou'];

  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
            {t('hero.title')}{' '}
            <span className="text-accent">{t('hero.titleAccent')}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t('hero.subtitle')}
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  className="pl-12 h-14 text-base bg-card border-0 shadow-lg focus:ring-2 focus:ring-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="hero" size="lg">
                {t('common.search')}
              </Button>
            </div>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="text-primary-foreground/60 text-sm">{t('hero.popularSearches')}:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/${currentLang}/${listingsSlug}?search=${encodeURIComponent(term)}`)}
                className="text-sm text-primary-foreground/80 hover:text-accent underline underline-offset-2 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;