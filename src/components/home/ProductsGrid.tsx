import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { products, Product } from '@/data/products';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

interface ProductsGridProps {
  titleKey: string;
  subtitleKey?: string;
  filterFn?: (products: Product[]) => Product[];
  limit?: number;
  showViewAll?: boolean;
}

const ProductsGrid = ({ 
  titleKey, 
  subtitleKey, 
  filterFn, 
  limit = 8,
  showViewAll = true 
}: ProductsGridProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const filteredProducts = filterFn ? filterFn(products) : products;
  const displayProducts = filteredProducts.slice(0, limit);

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
              <Link to={`/${currentLang}/${listingsSlug}`} className="flex items-center gap-1">
                {t('common.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;