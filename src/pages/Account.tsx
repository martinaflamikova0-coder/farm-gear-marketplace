import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Calendar, Euro, ChevronDown, ChevronUp, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, de, es, it, pt, type Locale } from 'date-fns/locale';

interface OrderItem {
  id: string;
  product_title: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  order_items: OrderItem[];
}

const getDateLocale = (lang: string) => {
  const locales: Record<string, Locale> = { fr, en: enUS, de, es, it, pt };
  return locales[lang] || fr;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const Account = () => {
  const { t, i18n } = useTranslation();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/${i18n.language}/auth`);
    }
  }, [user, authLoading, navigate, i18n.language]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_postal_code,
          order_items (
            id,
            product_title,
            product_price,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setIsLoading(false);
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate(`/${i18n.language}`);
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('account.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('account.logout')}
            </Button>
          </CardHeader>
        </Card>

        {/* Orders Section */}
        <h2 className="text-2xl font-bold mb-6">{t('account.orderHistory')}</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('account.noOrders')}</p>
              <Button 
                variant="default" 
                className="mt-4"
                onClick={() => navigate(`/${i18n.language}/annonces`)}
              >
                {t('account.browseProducts')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.created_at), 'PPP', { locale: getDateLocale(i18n.language) })}
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {t(`account.status.${order.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 font-semibold">
                        <Euro className="h-4 w-4" />
                        {order.total_amount.toLocaleString('fr-FR')}
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('account.orderNumber')}: {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </CardHeader>

                {expandedOrder === order.id && (
                  <CardContent className="border-t bg-muted/30">
                    {/* Shipping Address */}
                    {order.shipping_name && (
                      <div className="mb-4 p-3 bg-background rounded-lg">
                        <h4 className="font-medium mb-2">{t('account.shippingAddress')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.shipping_name}<br />
                          {order.shipping_address}<br />
                          {order.shipping_postal_code} {order.shipping_city}
                        </p>
                      </div>
                    )}

                    {/* Order Items */}
                    <h4 className="font-medium mb-3">{t('account.orderItems')}</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 bg-background rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.product_title}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('account.quantity')}: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {item.product_price.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Account;
