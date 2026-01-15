import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductWithSeller } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { getTranslatedTitle, getTranslatedDescription } from '@/hooks/useTranslatedProduct';
import { useTranslatedCategory } from '@/hooks/useTranslatedCategory';

interface ProductCardProps {
  product: ProductWithSeller;
  variant?: 'default' | 'horizontal';
}

// Check if product is out of stock (only for new items with stock tracking)
const isOutOfStock = (product: ProductWithSeller): boolean => {
  return product.condition === 'new' && product.stock !== null && product.stock === 0;
};

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const { translateCategory } = useTranslatedCategory();
  
  // Get translated content
  const translatedTitle = getTranslatedTitle(product, currentLang);
  const translatedDescription = getTranslatedDescription(product, currentLang);
  const translatedCategory = translateCategory(product.category);

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

  const formatReferenceNumber = (refNum: number | null) => {
    if (!refNum) return '';
    return `REFEQUITRAD${String(refNum).padStart(5, '0')}`;
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
  
  // Financing available for products >= 5000€
  const FINANCING_THRESHOLD = 5000;
  const FINANCING_MONTHS = 72;
  const hasFinancing = price >= FINANCING_THRESHOLD;
  const monthlyPayment = hasFinancing ? Math.round(price / FINANCING_MONTHS) : 0;

  if (variant === 'horizontal') {
    return (
      <Link to={productLink}>
        <Card className="hover-lift overflow-hidden border-border group">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={translatedTitle}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {product.condition && (
                <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
                  {getConditionTranslation(product.condition)}
                </Badge>
              )}
              {isOutOfStock(product) && (
                <Badge className="absolute top-10 left-2 bg-destructive text-destructive-foreground">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('product.outOfStock')}
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
                    <span className="font-mono font-medium">{formatReferenceNumber(product.reference_number)}</span> • {translatedCategory} • {product.brand}
                  </p>
                  <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-3 sm:line-clamp-2">
                    {translatedTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 sm:line-clamp-2">
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
                      {hasFinancing && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-success">
                          <CreditCard className="h-3 w-3" />
                          <span>{t('product.financing', { amount: formatPrice(monthlyPayment) })}</span>
                        </div>
                      )}
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
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={translatedTitle}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.condition && (
            <Badge className={`absolute top-2 left-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
              {getConditionTranslation(product.condition)}
            </Badge>
          )}
          {isOutOfStock(product) && (
            <Badge className="absolute top-10 left-2 bg-destructive text-destructive-foreground">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('product.outOfStock')}
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
            <span className="font-mono font-medium">{formatReferenceNumber(product.reference_number)}</span> • {translatedCategory} • {product.brand}
          </p>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-3 sm:line-clamp-2 min-h-[2.5rem]">
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
            {hasFinancing && (
              <div className="flex items-center gap-1 mt-1 text-xs text-success">
                <CreditCard className="h-3 w-3" />
                <span>{t('product.financing', { amount: formatPrice(monthlyPayment) })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
