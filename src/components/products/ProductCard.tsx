import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, Calendar, CreditCard, AlertTriangle, Star, Percent, Sparkles } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/imageProxy';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductWithSeller } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { getTranslatedTitle, getTranslatedDescription } from '@/hooks/useTranslatedProduct';
import { useTranslatedCategory } from '@/hooks/useTranslatedCategory';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { CART_MAX_PRICE } from '@/contexts/CartContext';
import { useProductGifts } from '@/hooks/useProductGifts';
import ProductGiftsBadge from '@/components/products/ProductGiftsBadge';
import { useActivePromotions, getBestPromotion, calculatePromotionalPrice, type Promotion } from '@/hooks/usePromotions';
import { 
  useMerchantCenterSettings, 
  isMcEnabled, 
  mcFlag, 
  mcPriceMode,
  getMerchantSafeImage 
} from '@/hooks/useMerchantCenterSettings';

// Generate consistent fake rating based on product ID (seeded random)
const generateRating = (productId: string) => {
  // Use product ID hash to generate consistent values
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Rating between 4.0 and 5.0
  const rating = 4 + (Math.abs(hash % 100) / 100);
  // Reviews between 12 and 248
  const reviews = 12 + Math.abs(hash % 237);
  
  return { rating: Math.round(rating * 10) / 10, reviews };
};

// Star rating component
const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars 
                ? 'fill-warning text-warning' 
                : i === fullStars && hasHalfStar 
                  ? 'fill-warning/50 text-warning' 
                  : 'fill-muted text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating.toFixed(1)} ({reviews})
      </span>
    </div>
  );
};

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
  const { data: activePromotions } = useActivePromotions();
  const { data: mcSettings } = useMerchantCenterSettings();
  
  // Merchant Center mode flags
  const mcEnabled = isMcEnabled(mcSettings);
  const hideDiscounts = mcFlag(mcSettings, 'mc_hide_discount_percent_everywhere');
  const hideCompareAtPrice = mcFlag(mcSettings, 'mc_hide_compare_at_price');
  const hideReviewStars = mcFlag(mcSettings, 'mc_hide_review_stars_in_cards');
  const hideFinancing = mcFlag(mcSettings, 'mc_hide_financing_in_cards');
  const hideVatMentions = mcFlag(mcSettings, 'mc_hide_vat_mentions_on_cards');
  const hideSecondaryPrice = mcFlag(mcSettings, 'mc_hide_secondary_price_text');
  const singlePriceOnly = mcFlag(mcSettings, 'mc_single_price_only');
  const hideBadges = mcFlag(mcSettings, 'mc_hide_badges_on_images');
  const hideUiChips = mcFlag(mcSettings, 'mc_hide_ui_chips_and_labels');
  const priceMode = mcPriceMode(mcSettings);
  
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
  
  // Use merchant-safe image if MC mode is enabled
  const normalImageUrl = product.images?.[0] || '/placeholder.svg';
  const merchantSafeImageUrl = (product as any).merchant_safe_image_url;
  const rawImageUrl = getMerchantSafeImage(mcSettings, normalImageUrl, merchantSafeImageUrl);
  const imageUrl = getImageUrl(rawImageUrl);
  
  const basePrice = Number(product.price) || 0;
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const storedDiscountPercentage = product.discount_percentage || 0;
  
  // Check for active time-limited promotion
  const activePromotion = activePromotions 
    ? getBestPromotion(activePromotions, { 
        id: product.id, 
        category: product.category, 
        price: basePrice 
      })
    : null;
  
  // Calculate promotional price if applicable
  const hasActivePromotion = !!activePromotion;
  const promotionalPrice = hasActivePromotion 
    ? calculatePromotionalPrice(basePrice, activePromotion)
    : null;
  
  // Final display price (promotional price takes precedence)
  const price = promotionalPrice !== null ? promotionalPrice : basePrice;
  
  // Automatic discount calculation: 20-35% based on price tier (if no discount is set)
  const calculateAutoDiscount = (currentPrice: number): number => {
    if (currentPrice >= 50000) return 35;
    if (currentPrice >= 20000) return 30;
    if (currentPrice >= 10000) return 25;
    if (currentPrice >= 5000) return 22;
    return 20;
  };
  
  // Determine effective discount: promotional discount takes precedence
  const effectiveDiscountPercentage = hasActivePromotion && activePromotion.discount_type === 'percentage'
    ? activePromotion.discount_value
    : storedDiscountPercentage > 0 
      ? storedDiscountPercentage 
      : (originalPrice && originalPrice > basePrice) 
        ? Math.round((1 - basePrice / originalPrice) * 100) 
        : calculateAutoDiscount(basePrice);
  
  // Calculate display original price
  const displayOriginalPrice = hasActivePromotion 
    ? basePrice
    : originalPrice && originalPrice > basePrice 
      ? originalPrice 
      : Math.round(basePrice / (1 - effectiveDiscountPercentage / 100));
  
  // Show discount only if not in MC mode with discount hiding
  const shouldShowDiscount = !hideDiscounts && !hideCompareAtPrice;
  const hasDiscount = shouldShowDiscount;
  const displayDiscountPercentage = hasActivePromotion && activePromotion.discount_type === 'percentage'
    ? activePromotion.discount_value
    : effectiveDiscountPercentage;
  
  // Price display based on MC settings
  const priceHT = Math.round(price / 1.2);
  const displayPrice = priceMode === 'HT_only' ? priceHT : price;
  const displayPriceLabel = priceMode === 'HT_only' ? t('product.priceHT') : '';
  
  // Financing available for products >= 5000€ (hidden in MC mode)
  const FINANCING_THRESHOLD = 5000;
  const FINANCING_MONTHS = 72;
  const hasFinancing = price >= FINANCING_THRESHOLD && !hideFinancing;
  const monthlyPayment = hasFinancing ? Math.round(price / FINANCING_MONTHS) : 0;
  
  // Generate consistent rating for this product (hidden in MC mode)
  const { rating, reviews } = generateRating(product.id);
  const showRating = !hideReviewStars;
  
  // Get automatic gifts for this product
  const gifts = useProductGifts(product);

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
                onError={handleImageError}
              />
              {!hideBadges && <ProductGiftsBadge gifts={gifts} variant="card" />}
              {!hideBadges && product.condition && (
                <Badge className={`absolute top-2 right-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
                  {getConditionTranslation(product.condition)}
                </Badge>
              )}
              {!hideBadges && isOutOfStock(product) && (
                <Badge className="absolute top-10 right-2 bg-destructive text-destructive-foreground">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('product.outOfStock')}
                </Badge>
              )}
              {!hideDiscounts && hasActivePromotion && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-accent to-primary text-primary-foreground gap-1 animate-pulse shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  -{activePromotion.discount_type === 'percentage' ? `${activePromotion.discount_value}%` : `${activePromotion.discount_value}€`}
                </Badge>
              )}
              {!hideDiscounts && !hasActivePromotion && hasDiscount && displayDiscountPercentage > 0 && (
                <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground gap-1">
                  <Percent className="h-3 w-3" />
                  -{displayDiscountPercentage}%
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
                  {showRating && (
                    <div className="mt-1">
                      <StarRating rating={rating} reviews={reviews} />
                    </div>
                  )}
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
                      {!hideCompareAtPrice && hasDiscount && displayOriginalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(displayOriginalPrice)}
                        </p>
                      )}
                      <p className="text-2xl font-display font-bold text-primary">
                        {formatPrice(displayPrice)}
                      </p>
                      {!hideVatMentions && !singlePriceOnly && priceMode !== 'HT_only' && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(priceHT)} {t('product.priceHT')}
                        </p>
                      )}
                      {hasFinancing && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-success">
                          <CreditCard className="h-3 w-3" />
                          <span>{t('product.financing', { amount: formatPrice(monthlyPayment) })}</span>
                        </div>
                      )}
                    </div>
                    {price <= CART_MAX_PRICE && (
                      <div onClick={(e) => e.preventDefault()}>
                        <AddToCartButton
                          productId={product.id}
                          price={price}
                          condition={product.condition}
                          stock={product.stock}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    )}
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
            onError={handleImageError}
          />
          {!hideBadges && <ProductGiftsBadge gifts={gifts} variant="card" />}
          {!hideBadges && product.condition && (
            <Badge className={`absolute top-2 right-2 ${conditionColors[product.condition] || 'bg-muted'}`}>
              {getConditionTranslation(product.condition)}
            </Badge>
          )}
          {!hideBadges && isOutOfStock(product) && (
            <Badge className="absolute top-10 right-2 bg-destructive text-destructive-foreground">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('product.outOfStock')}
            </Badge>
          )}
          {!hideDiscounts && hasActivePromotion && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-accent to-primary text-primary-foreground gap-1 animate-pulse shadow-lg">
              <Sparkles className="h-3 w-3" />
              -{activePromotion.discount_type === 'percentage' ? `${activePromotion.discount_value}%` : `${activePromotion.discount_value}€`}
            </Badge>
          )}
          {!hideDiscounts && !hasActivePromotion && hasDiscount && displayDiscountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground gap-1">
              <Percent className="h-3 w-3" />
              -{displayDiscountPercentage}%
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
          {showRating && (
            <div className="mt-1">
              <StarRating rating={rating} reviews={reviews} />
            </div>
          )}
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {!hideCompareAtPrice && hasDiscount && displayOriginalPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(displayOriginalPrice)}
                  </p>
                )}
                <p className="text-xl font-display font-bold text-primary">
                  {formatPrice(displayPrice)}
                </p>
                {!hideVatMentions && !singlePriceOnly && priceMode !== 'HT_only' && (
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(priceHT)} {t('product.priceHT')}
                  </p>
                )}
                {hasFinancing && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-success">
                    <CreditCard className="h-3 w-3" />
                    <span>{t('product.financing', { amount: formatPrice(monthlyPayment) })}</span>
                  </div>
                )}
              </div>
              {price <= CART_MAX_PRICE && (
                <div onClick={(e) => e.preventDefault()}>
                  <AddToCartButton
                    productId={product.id}
                    price={price}
                    condition={product.condition}
                    stock={product.stock}
                    size="icon"
                    showLabel={false}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
