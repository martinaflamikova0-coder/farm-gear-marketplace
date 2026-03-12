import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useRecentProducts } from '@/hooks/useProducts';

const RecentProducts = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: recentProducts = [], isLoading } = useRecentProducts(4);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[200px] h-80 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-accent">{t('home.recentSubtitle')}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('home.recentListings')}
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentProducts.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProducts;
