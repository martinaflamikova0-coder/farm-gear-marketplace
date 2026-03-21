import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
