import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useBestSellers, useLatestProducts } from '@/hooks/useProducts';

const LatestProductsSection = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: bestSellers = [] } = useBestSellers(100);
  const bestSellerIds = bestSellers.map(p => p.id);
  const { data: latestProducts = [], isLoading } = useLatestProducts(bestSellerIds, 100);

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wrench className="h-6 w-6 text-amber-600" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[200px] h-72 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestProducts.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('home.latestProducts', 'Construction Equipment')}
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {latestProducts.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestProductsSection;
