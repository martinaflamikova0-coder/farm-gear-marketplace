import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[200px] h-80 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container-custom">
        <div className="mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('home.featuredListings')}
          </h2>
          <p className="text-muted-foreground">
            {t('home.featuredSubtitle')}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredProducts.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
