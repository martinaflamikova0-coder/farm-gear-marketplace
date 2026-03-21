import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

interface ProductsGridProps {
  titleKey: string;
  subtitleKey?: string;
  category?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ProductsGrid = ({ titleKey, subtitleKey, category, limit = 8 }: ProductsGridProps) => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts({ category, limit });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container-custom">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
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
        <div className="mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {t(titleKey)}
          </h2>
          {subtitleKey && (
            <p className="text-sm text-muted-foreground mt-1">{t(subtitleKey)}</p>
          )}
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

export default ProductsGrid;
