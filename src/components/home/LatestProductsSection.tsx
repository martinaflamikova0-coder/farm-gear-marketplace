import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useBestSellers, useLatestProducts } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const ITEMS_PER_PAGE = 8;

const LatestProductsSection = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  const [currentPage, setCurrentPage] = useState(0);

  // Get best-seller IDs to exclude them
  const { data: bestSellers = [] } = useBestSellers(100);
  const bestSellerIds = bestSellers.map(p => p.id);
  
  const { data: latestProducts = [], isLoading } = useLatestProducts(bestSellerIds, 100);

  const totalPages = Math.ceil(latestProducts.length / ITEMS_PER_PAGE);
  const currentProducts = latestProducts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wrench className="h-6 w-6 text-amber-600" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestProducts.length === 0) return null;

  // Group by subcategory for the pills
  const subcategoryCounts = latestProducts.reduce((acc, p) => {
    const sub = p.subcategory || 'other';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const subcategoryCount = Object.keys(subcategoryCounts).length;

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wrench className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {t('home.latestProducts', 'Construction Equipment')}
              </h2>
            </div>
          </div>
        </div>

        {/* Subcategory pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(subcategoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([slug, count]) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              >
                {t(`categoryNames.${slug}`, slug)} ({count})
              </span>
            ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-1">
            {Array.from({ length: Math.min(totalPages, 15) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-amber-500 w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default LatestProductsSection;
