import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { usePremiumProducts } from '@/hooks/useProducts';
import CarouselScrollButtons from './CarouselScrollButtons';

const PremiumProducts = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: premiumProducts = [], isLoading } = usePremiumProducts(10);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
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

  if (premiumProducts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container-custom">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-wide">
                {t('home.premiumSubtitle')}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t('home.premiumListings')}
            </h2>
          </div>
          <CarouselScrollButtons scrollRef={scrollRef} />
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {premiumProducts.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumProducts;
