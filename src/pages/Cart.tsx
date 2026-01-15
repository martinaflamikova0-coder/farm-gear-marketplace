import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || 'fr') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  
  const { items, itemCount, total, isLoading, user, removeFromCart, updateQuantity } = useCart();

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

  // Redirect to login if not authenticated
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead titleKey="seo.cart.title" descriptionKey="seo.cart.description" />
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="font-display text-2xl">
                {t('cart.loginRequired')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>{t('cart.loginDescription')}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link to={`/${currentLang}/auth?redirect=/${currentLang}/panier`}>
                  {t('cart.login')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead titleKey="seo.cart.title" descriptionKey="seo.cart.description" />
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-custom py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.cart.title" descriptionKey="seo.cart.description" />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
              <Link to={`/${currentLang}/${listingsSlug}`}>
                <ArrowLeft className="h-4 w-4" />
                {t('cart.continueShopping')}
              </Link>
            </Button>
          </nav>

          <h1 className="font-display text-3xl font-bold mb-6">
            {t('cart.title')} ({itemCount} {itemCount > 1 ? t('cart.items') : t('cart.item')})
          </h1>

          {items.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-display text-xl font-semibold mb-2">
                  {t('cart.empty')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('cart.emptyDescription')}
                </p>
                <Button asChild>
                  <Link to={`/${currentLang}/${listingsSlug}`}>
                    {t('cart.browseProducts')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-muted">
                        <Link to={`/${currentLang}/${getLocalizedSlug('listing', currentLang)}/${item.product.id}`}>
                          <img
                            src={item.product.images?.[0] || '/placeholder.svg'}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      </div>
                      
                      {/* Product details */}
                      <CardContent className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/${currentLang}/${getLocalizedSlug('listing', currentLang)}/${item.product.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.product.brand}
                          </p>
                          <p className="font-display font-bold text-primary mt-2">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-4">
                          {item.product.condition === 'new' && (
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                disabled={
                                  item.product.stock !== null && 
                                  item.quantity >= item.product.stock
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display">{t('cart.summary')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.shipping')}</span>
                      <span className="text-success">{t('cart.freeShipping')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('cart.total')}</span>
                      <span className="font-display text-primary">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('product.vatDisclaimer')}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate(`/${currentLang}/checkout`)}
                    >
                      {t('cart.checkout')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
