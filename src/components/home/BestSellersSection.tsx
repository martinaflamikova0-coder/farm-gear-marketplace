import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useBestSellers } from '@/hooks/useProducts';
import CarouselScrollButtons from './CarouselScrollButtons';

const BestSellersSection = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: bestSellers = [], isLoading } = useBestSellers(100);

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-amber-600" />
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

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t('home.bestsellers', 'Top 100 Meilleures Ventes')}
            </h2>
          </div>
          <CarouselScrollButtons scrollRef={scrollRef} />
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellers.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
