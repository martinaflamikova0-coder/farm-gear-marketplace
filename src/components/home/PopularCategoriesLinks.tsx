import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const PopularCategoriesLinks = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  const { data: categories = [] } = useCategories();

  // Define main categories in order
  const mainCategoryOrder = [
    'tracteurs',
    'recolte',
    'travail-sol',
    'elevage',
    'manutention',
    'chantier',
    'pieces',
  ];

  const sortedCategories = mainCategoryOrder
    .map((slug) => categories?.find((c) => c.slug === slug))
    .filter(Boolean);

  const handleCategoryClick = (slug: string) => {
    navigate(`/${currentLang}/${listingsSlug}?category=${slug}`);
  };

  const handleViewAll = () => {
    navigate(`/${currentLang}/categories`);
  };

  return (
    <section className="bg-gradient-to-b from-secondary/20 to-secondary/5 py-12 md:py-16">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('home.exploreCategories') || 'Explore Popular Categories'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('home.exploreCategoriesDesc') || 'Browse our most popular categories and find what you need'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {sortedCategories.map((category) => (
            <button
              key={category?.id}
              onClick={() => handleCategoryClick(category?.slug || '')}
              className="group relative overflow-hidden rounded-lg border border-primary/20 bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-md hover:bg-primary/5"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="text-3xl">{category?.icon || '📦'}</div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {category?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('common.viewAll')}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-t from-primary/10 to-transparent" />
            </button>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleViewAll}
            variant="outline"
            size="lg"
            className="group"
          >
            {t('home.viewAllCategories') || 'View All Categories'}
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesLinks;
