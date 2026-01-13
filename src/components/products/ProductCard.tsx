import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const conditionColors = {
    'Excellent': 'bg-success text-success-foreground',
    'Très bon': 'bg-primary text-primary-foreground',
    'Bon': 'bg-warning text-warning-foreground',
    'Correct': 'bg-muted text-muted-foreground',
  };

  if (variant === 'horizontal') {
    return (
      <Link to={`/annonce/${product.id}`}>
        <Card className="hover-lift overflow-hidden border-border group">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition]}`}>
                {product.condition}
              </Badge>
              {product.featured && (
                <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                  ⭐ Vedette
                </Badge>
              )}
            </div>
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.category} • {product.brand}
                  </p>
                  <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {product.year}
                    </span>
                    {product.hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {product.hours.toLocaleString('fr-FR')} h
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.location}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-display font-bold text-primary">
                        {formatPrice(product.priceTTC)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(product.priceHT)} HT
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      Voir l'annonce →
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/annonce/${product.id}`}>
      <Card className="hover-lift overflow-hidden border-border group h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition]}`}>
            {product.condition}
          </Badge>
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              ⭐ Vedette
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category} • {product.brand}
          </p>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {product.year}
            </span>
            {product.hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {product.hours.toLocaleString('fr-FR')} h
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{product.location}</span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xl font-display font-bold text-primary">
              {formatPrice(product.priceTTC)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(product.priceHT)} HT
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
