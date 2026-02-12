import { useTranslation } from 'react-i18next';
import { useCategoriesWithCounts } from '@/hooks/useCategories';
import { type SupportedLanguage } from '@/i18n';
import CategoryCard from '@/components/products/CategoryCard';
import SEOHead from '@/components/SEOHead';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const { data: categories = [] } = useCategoriesWithCounts();

  return (
    <>
      <SEOHead 
        titleKey="seo.categories.title"
        descriptionKey="seo.categories.description"
        keywordsKey="seo.categories.keywords"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 md:py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('pages.categories.title') || 'All Categories'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t('pages.categories.description') || 'Browse all our available categories'}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <main className="container-custom py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default Categories;
