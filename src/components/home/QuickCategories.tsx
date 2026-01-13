import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoriesWithCounts, type CategoryWithCount } from '@/hooks/useCategories';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const QuickCategories = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  
  const { data: categories, isLoading } = useCategoriesWithCounts();

  const getCategoryName = (category: CategoryWithCount) => {
    const categoryMap: Record<string, string> = {
      'tracteurs': t('categories.tractors'),
      'recolte': t('categories.harvest'),
      'travail-sol': t('categories.tillage'),
      'elevage': t('categories.livestock'),
      'manutention': t('categories.handling'),
      'chantier': t('categories.construction'),
      'pieces': t('categories.parts'),
      'autres': t('categories.other')
    };
    return categoryMap[category.slug] || category.name;
  };

  if (isLoading) {
    return (
      <div className="bg-secondary/50 border-b border-border">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-32 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 border-b border-border">
      <div className="container-custom py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link
            to={`/${currentLang}/${listingsSlug}`}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('common.viewAll')}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/${currentLang}/${listingsSlug}?category=${category.slug}`}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="mr-1.5">{category.icon}</span>
              {getCategoryName(category)}
              <span className="ml-1.5 text-muted-foreground">({category.count})</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickCategories;
