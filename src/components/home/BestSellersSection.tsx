import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { useBestSellers } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const ITEMS_PER_PAGE = 8;

const BestSellersSection = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: bestSellers = [], isLoading } = useBestSellers(100);

  const totalPages = Math.ceil(bestSellers.length / ITEMS_PER_PAGE);
  const currentProducts = bestSellers.slice(
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
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

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {t('home.bestsellers', 'Top 100 Meilleures Ventes')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('home.bestsellersSubtitle', 'Les équipements les plus populaires sélectionnés pour vous')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, bestSellers.length)} / {bestSellers.length}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentProducts.map((product, index) => (
            <div key={product.id} className="relative">
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 z-10 flex items-center justify-center w-8 h-8 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                #{currentPage * ITEMS_PER_PAGE + index + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
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

        <div className="flex justify-center mt-6">
          <Button variant="outline" asChild>
            <Link to={`/${currentLang}/${listingsSlug}`} className="flex items-center gap-2">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
