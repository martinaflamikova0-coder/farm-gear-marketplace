import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

const LawnMowersSection = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading } = useProducts({ search: 'tondeuse', limit: 8 });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-success/5 to-transparent">
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

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-success/5 to-transparent">
      <div className="container-custom">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-6 w-6 text-success" />
            <span className="text-sm font-semibold text-success uppercase tracking-wide">
              {t('home.lawnMowersSubtitle')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('home.lawnMowers')}
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LawnMowersSection;
