import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import CarouselScrollButtons from './CarouselScrollButtons';

interface ProductsGridProps {
  titleKey: string;
  subtitleKey?: string;
  category?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ProductsGrid = ({ titleKey, subtitleKey, category, limit = 8 }: ProductsGridProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading } = useProducts({ category, limit });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container-custom">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[200px] h-64 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              {t(titleKey)}
            </h2>
            {subtitleKey && (
              <p className="text-sm text-muted-foreground mt-1">{t(subtitleKey)}</p>
            )}
          </div>
          <CarouselScrollButtons scrollRef={scrollRef} />
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
