import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

const QuickCategories = () => {
  return (
    <div className="bg-secondary/50 border-b border-border">
      <div className="container-custom py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link
            to="/annonces"
            className="flex-shrink-0 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Tout voir
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/annonces?category=${category.slug}`}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
              <span className="ml-1.5 text-muted-foreground">({category.count})</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickCategories;
