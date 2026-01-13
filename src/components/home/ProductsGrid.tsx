import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, type ProductWithSeller } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

interface ProductsGridProps {
  titleKey: string;
  subtitleKey?: string;
  category?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ProductsGrid = ({ 
  titleKey, 
  subtitleKey, 
  category,
  limit = 8,
  showViewAll = true 
}: ProductsGridProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const { data: products = [], isLoading } = useProducts({ category, limit });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              {t(titleKey)}
            </h2>
            {subtitleKey && (
              <p className="text-sm text-muted-foreground mt-1">{t(subtitleKey)}</p>
            )}
          </div>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/${currentLang}/${listingsSlug}${category ? `?category=${category}` : ''}`} className="flex items-center gap-1">
                {t('common.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
