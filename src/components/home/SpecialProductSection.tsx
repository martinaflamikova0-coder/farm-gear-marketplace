import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import CarouselScrollButtons from './CarouselScrollButtons';

interface SpecialProductSectionProps {
  titleKey: string;
  subtitleKey: string;
  searchTerm: string;
  limit?: number;
  icon: LucideIcon;
  iconColorClass?: string;
  bgClass?: string;
}

const SpecialProductSection = ({
  titleKey,
  subtitleKey,
  searchTerm,
  limit = 25,
  icon: Icon,
  iconColorClass = 'text-primary',
  bgClass = 'bg-gradient-to-b from-primary/5 to-transparent',
}: SpecialProductSectionProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading } = useProducts({ search: searchTerm, limit });

  if (isLoading) {
    return (
      <section className={`py-12 ${bgClass}`}>
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
    <section className={`py-12 ${bgClass}`}>
      <div className="container-custom">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-5 w-5 ${iconColorClass}`} />
              <span className={`text-sm font-semibold uppercase tracking-wide ${iconColorClass}`}>
                {t(subtitleKey)}
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t(titleKey)}
            </h2>
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

export default SpecialProductSection;
