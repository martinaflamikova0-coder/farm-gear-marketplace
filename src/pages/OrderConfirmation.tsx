import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Package, Loader2, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { type SupportedLanguage } from '@/i18n';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_name: string | null;
  shipping_email: string | null;
  order_items: OrderItem[];
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

const OrderConfirmation = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const currentLang = (i18n.language || 'en') as SupportedLanguage;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError(t('orderConfirmation.noOrderId', 'No order ID provided'));
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total_amount,
            status,
            shipping_name,
            shipping_email,
            order_items (
              id,
              product_id,
              product_title,
              product_price,
              quantity
            )
          `)
          .eq('id', orderId)
          .single();

        if (queryError) {
          console.error('Order fetch error:', queryError);
          setError(t('orderConfirmation.orderNotFound', 'Order not found'));
          setIsLoading(false);
          return;
        }

        if (!data) {
          setError(t('orderConfirmation.orderNotFound', 'Order not found'));
          setIsLoading(false);
          return;
        }

        setOrder(data as Order);

        // Fire gtag purchase event for Google Merchant Center
        if (typeof window.gtag === 'function') {
          const items = (data.order_items as OrderItem[]).map(item => ({
            item_id: item.product_id,
            item_name: item.product_title,
            price: item.product_price,
            quantity: item.quantity,
          }));

          window.gtag('event', 'purchase', {
            transaction_id: data.id,
            value: data.total_amount,
            currency: 'EUR',
            items: items,
          });

          console.log('Purchase event fired for Google Merchant Center', {
            transaction_id: data.id,
            value: data.total_amount,
            currency: 'EUR',
            items: items,
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching order:', err);
        setError(t('orderConfirmation.unexpectedError', 'An unexpected error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, t]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(currentLang === 'en' ? 'en-GB' : currentLang === 'de' ? 'de-DE' : currentLang === 'es' ? 'es-ES' : currentLang === 'it' ? 'it-IT' : currentLang === 'pt' ? 'pt-PT' : 'fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <HeaderSpacer />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-12 pb-12 space-y-6">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <HeaderSpacer />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-destructive font-semibold mb-6">{error}</p>
                <Link to={`/${currentLang}/account`}>
                  <Button>{t('orderConfirmation.backToAccount', 'Go to Account')}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeaderSpacer />
      <SEOHead 
        titleKey="seo.orderConfirmation.title" 
        descriptionKey="seo.orderConfirmation.description"
      />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-20 w-20 text-success" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {t('orderConfirmation.title', 'Order Confirmed!')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('orderConfirmation.subtitle', 'Thank you for your purchase')}
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('orderConfirmation.orderDetails', 'Order Details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order ID */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('orderConfirmation.orderId', 'Order ID')}
                  </p>
                  <p className="font-mono font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('orderConfirmation.orderDate', 'Order Date')}
                  </p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString(
                      currentLang === 'en' ? 'en-GB' : 
                      currentLang === 'de' ? 'de-DE' : 
                      currentLang === 'es' ? 'es-ES' : 
                      currentLang === 'it' ? 'it-IT' : 
                      currentLang === 'pt' ? 'pt-PT' : 
                      'fr-FR'
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Name */}
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('orderConfirmation.customerName', 'Customer Name')}
                </p>
                <p className="font-semibold">{order.shipping_name || 'N/A'}</p>
              </div>

              {/* Items List */}
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('orderConfirmation.items', 'Items')}
                </p>
                <div className="space-y-3">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('orderConfirmation.quantity', 'Quantity')}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.product_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-lg font-semibold">
                  {t('orderConfirmation.total', 'Total')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information Messages */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3">
              {t('orderConfirmation.whatNext', 'What Happens Next?')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('orderConfirmation.confirmationEmail', 'A confirmation email has been sent to your inbox')}</li>
              <li>• {t('orderConfirmation.invoiceAvailable', 'Your invoice is available in your account and email')}</li>
              <li>• {t('orderConfirmation.trackOrder', 'You can track your order status in your account')}</li>
              <li>• {t('orderConfirmation.supportContact', 'For questions, please contact our support team')}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/${currentLang}/account`} className="flex-1">
              <Button variant="outline" className="w-full">
                {t('orderConfirmation.viewAccount', 'View Your Account')}
              </Button>
            </Link>
            <Link to={`/${currentLang}/annonces`} className="flex-1">
              <Button className="w-full">
                {t('orderConfirmation.continueShopping', 'Continue Shopping')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
