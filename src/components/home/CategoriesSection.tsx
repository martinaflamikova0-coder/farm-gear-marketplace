import { useTranslation } from 'react-i18next';
import CategoryCard from '@/components/products/CategoryCard';
import { useCategoriesWithCounts } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

const CategoriesSection = () => {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useCategoriesWithCounts();

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-10">
            <Skeleton className="h-10 w-64 mx-auto mb-3" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('home.browseByCategory')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('home.categoryDescription')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
