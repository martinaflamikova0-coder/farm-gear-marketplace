import CategoryCard from '@/components/products/CategoryCard';
import { categories } from '@/data/products';

const CategoriesSection = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Parcourir par catégorie
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement le matériel dont vous avez besoin parmi nos différentes catégories
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
