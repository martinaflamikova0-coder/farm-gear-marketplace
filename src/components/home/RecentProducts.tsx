import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { getRecentProducts } from '@/data/products';

const RecentProducts = () => {
  const recentProducts = getRecentProducts(4);

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Nouvelles arrivées</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Dernières annonces
            </h2>
          </div>
          <Button variant="default" asChild>
            <Link to="/annonces" className="flex items-center gap-2">
              Explorer le catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProducts;
