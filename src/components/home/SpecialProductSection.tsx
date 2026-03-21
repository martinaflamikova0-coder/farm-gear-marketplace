import { useTranslation } from 'react-i18next';
import { type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

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
  const { data: products = [], isLoading } = useProducts({ search: searchTerm, limit });

  if (isLoading) {
    return (
      <section className={`py-12 ${bgClass}`}>
        <div className="container-custom">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
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
        <div className="mb-8">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialProductSection;
