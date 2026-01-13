import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useRecentProducts } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const RecentProducts = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  
  const { data: recentProducts = [], isLoading } = useRecentProducts(4);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">{t('home.recentSubtitle')}</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t('home.recentListings')}
            </h2>
          </div>
          <Button variant="default" asChild>
            <Link to={`/${currentLang}/${listingsSlug}`} className="flex items-center gap-2">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProducts;
