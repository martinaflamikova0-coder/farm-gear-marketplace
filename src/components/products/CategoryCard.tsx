import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import type { CategoryWithCount } from '@/hooks/useCategories';

interface CategoryCardProps {
  category: CategoryWithCount;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  // Map category slugs to translation keys
  const getCategoryName = () => {
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

  return (
    <Link to={`/${currentLang}/${listingsSlug}?category=${category.slug}`}>
      <Card className="hover-lift overflow-hidden border-border group h-full bg-gradient-to-br from-card to-secondary/30">
        <CardContent className="p-6 flex flex-col items-center text-center h-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-4 group-hover:bg-primary/20 transition-colors">
            {category.icon}
          </div>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {getCategoryName()}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {category.count} {t('common.listings')}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {t('common.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
