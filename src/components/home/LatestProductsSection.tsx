import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useLatestProducts } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const ITEMS_PER_PAGE = 8;

const LatestProductsSection = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: latestProducts = [], isLoading } = useLatestProducts(0, 100);

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
      <section className="py-12 bg-gradient-to-b from-accent/5 to-background">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Wrench className="h-6 w-6 text-accent" />
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

  // Group by subcategory for the subtitle
  const subcategoryCounts = latestProducts.reduce((acc, p) => {
    const sub = p.subcategory || 'other';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const subcategoryCount = Object.keys(subcategoryCounts).length;

  return (
    <section className="py-12 bg-gradient-to-b from-accent/5 to-background">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 rounded-xl">
              <Wrench className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {t('home.latestProducts', 'Construction Equipment')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {latestProducts.length} {t('common.products', 'products')} · {subcategoryCount} {t('home.subcategories', 'subcategories')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, latestProducts.length)} / {latestProducts.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subcategory pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(subcategoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([slug, count]) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
              >
                {t(`categoryNames.${slug}`, slug)} ({count})
              </span>
            ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
                    ? 'bg-accent w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button variant="outline" asChild>
            <Link to={`/${currentLang}/${listingsSlug}?category=chantier`} className="flex items-center gap-2">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestProductsSection;
