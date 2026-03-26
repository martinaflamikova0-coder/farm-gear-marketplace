import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { trimToCompleteRows, PRODUCT_GRID_CLASSES } from '@/lib/gridUtils';

interface ProductsGridProps {
  titleKey: string;
  subtitleKey?: string;
  category?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ProductsGrid = ({ titleKey, subtitleKey, category, limit = 12 }: ProductsGridProps) => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts({ category, limit });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container-custom">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className={PRODUCT_GRID_CLASSES}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = trimToCompleteRows(products);
  if (displayProducts.length === 0) return null;

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

        <div className={PRODUCT_GRID_CLASSES}>
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
