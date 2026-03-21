import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { usePremiumProducts } from '@/hooks/useProducts';

const PremiumProducts = () => {
  const { t } = useTranslation();
  const { data: premiumProducts = [], isLoading } = usePremiumProducts(10);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
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

  if (premiumProducts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container-custom">
        <div className="mb-10">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {premiumProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumProducts;
