import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductWithSeller } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { getTranslatedTitle, getTranslatedDescription } from '@/hooks/useTranslatedProduct';

interface ProductCardProps {
  product: ProductWithSeller;
  variant?: 'default' | 'horizontal';
}

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  
  // Get translated content
  const translatedTitle = getTranslatedTitle(product, currentLang);
  const translatedDescription = getTranslatedDescription(product, currentLang);

  const formatPrice = (price: number) => {
    const locale = currentLang === 'en' ? 'en-GB' : 
                   currentLang === 'de' ? 'de-DE' : 
                   currentLang === 'es' ? 'es-ES' :
                   currentLang === 'it' ? 'it-IT' :
                   currentLang === 'pt' ? 'pt-PT' : 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    const locale = currentLang === 'en' ? 'en-GB' : 
                   currentLang === 'de' ? 'de-DE' : 
                   currentLang === 'es' ? 'es-ES' :
                   currentLang === 'it' ? 'it-IT' :
                   currentLang === 'pt' ? 'pt-PT' : 'fr-FR';
    return num.toLocaleString(locale);
  };

  const getConditionTranslation = (condition: string | null) => {
    if (!condition) return '';
    const conditionMap: Record<string, string> = {
      'new': t('conditions.new'),
      'used': t('conditions.used'),
      'refurbished': t('conditions.refurbished'),
    };
    return conditionMap[condition] || condition;
  };

  const conditionColors: Record<string, string> = {
    'new': 'bg-success text-success-foreground',
    'used': 'bg-primary text-primary-foreground',
    'refurbished': 'bg-warning text-warning-foreground',
  };

  const detailSlug = getLocalizedSlug('listing', currentLang);
  const productLink = `/${currentLang}/${detailSlug}/${product.id}`;
  
  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const price = Number(product.price) || 0;
  const priceHT = Math.round(price / 1.2); // Approximate HT from TTC

  if (variant === 'horizontal') {
    return (
      <Link to={productLink}>
        <Card className="hover-lift overflow-hidden border-border group">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
              <img
                src={imageUrl}
                alt={translatedTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {product.condition && (
                <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
                  {getConditionTranslation(product.condition)}
                </Badge>
              )}
              {product.featured && (
                <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                  ⭐
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
                    {translatedTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {translatedDescription}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                    {product.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {product.year}
                      </span>
                    )}
                    {product.hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatNumber(product.hours)} h
                      </span>
                    )}
                    {product.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-display font-bold text-primary">
                        {formatPrice(price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(priceHT)} {t('product.priceHT')}
                      </p>
                    </div>
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
    <Link to={productLink}>
      <Card className="hover-lift overflow-hidden border-border group h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={translatedTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.condition && (
            <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
              {getConditionTranslation(product.condition)}
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              ⭐
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category} • {product.brand}
          </p>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {translatedTitle}
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
            {product.year && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {product.year}
              </span>
            )}
            {product.hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatNumber(product.hours)} h
              </span>
            )}
          </div>
          
          {product.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{product.location}</span>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xl font-display font-bold text-primary">
              {formatPrice(price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(priceHT)} {t('product.priceHT')}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
