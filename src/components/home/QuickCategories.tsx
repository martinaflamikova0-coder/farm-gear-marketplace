import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories } from '@/data/products';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const QuickCategories = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);

  const getCategoryName = (category: typeof categories[0]) => {
    const categoryMap: Record<string, string> = {
      'Tracteurs': t('categories.tractors'),
      'Matériel de récolte': t('categories.harvest'),
      'Travail du sol': t('categories.tillage'),
      'Matériel d\'élevage': t('categories.livestock'),
      'Manutention': t('categories.handling'),
      'Matériel de chantier': t('categories.construction'),
      'Pièces et accessoires': t('categories.parts'),
      'Autres matériels': t('categories.other')
    };
    return categoryMap[category.name] || category.name;
  };

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