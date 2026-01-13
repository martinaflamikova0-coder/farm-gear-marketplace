import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/data/products';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/annonces?category=${category.slug}`}>
      <Card className="hover-lift overflow-hidden border-border group h-full bg-gradient-to-br from-card to-secondary/30">
        <CardContent className="p-6 flex flex-col items-center text-center h-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-4 group-hover:bg-primary/20 transition-colors">
            {category.icon}
          </div>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {category.count} annonces
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
