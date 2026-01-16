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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Calendar, Euro, ChevronDown, ChevronUp, LogOut, User, FileImage, Download, Eye, MapPin, Receipt, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, de, es, it, pt, type Locale } from 'date-fns/locale';
import { toast } from 'sonner';
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
  payment_receipt_url: string | null;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
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
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; orderId: string } | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

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
          payment_receipt_url,
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_postal_code,
          shipping_country,
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

  const viewReceipt = async (receiptPath: string, orderId: string) => {
    const { data } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 3600);

    if (data?.signedUrl) {
      setSelectedReceipt({ url: data.signedUrl, orderId });
      setReceiptDialogOpen(true);
    }
  };

  const downloadReceipt = async (receiptPath: string, orderId: string) => {
    const { data } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 60);

    if (data?.signedUrl) {
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.target = '_blank';
      link.download = `receipt-${orderId.slice(0, 8)}.${receiptPath.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('account.receiptDownloaded'));
    }
  };

  const handleViewInvoice = async (orderId: string) => {
    try {
      setGeneratingInvoice(orderId);
      const response = await supabase.functions.invoke('generate-invoice', {
        body: { orderId }
      });

      if (response.error) throw response.error;

      // Response is ArrayBuffer for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Revoke after a delay to allow the window to open
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(t('account.errorGeneratingInvoice'));
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setGeneratingInvoice(orderId);
      const response = await supabase.functions.invoke('generate-invoice', {
        body: { orderId }
      });

      if (response.error) throw response.error;

      // Response is ArrayBuffer for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('account.invoiceDownloaded'));
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(t('account.errorDownloadingInvoice'));
    } finally {
      setGeneratingInvoice(null);
    }
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
                  <CardContent className="border-t bg-muted/30 space-y-4">
                    {/* Shipping Address */}
                    {order.shipping_name && (
                      <div className="p-3 bg-background rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t('account.shippingAddress')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {order.shipping_name}<br />
                          {order.shipping_address}<br />
                          {order.shipping_postal_code} {order.shipping_city}
                          {order.shipping_country && <><br />{order.shipping_country}</>}
                        </p>
                      </div>
                    )}

                    {/* Payment Receipt */}
                    {order.payment_receipt_url && (
                      <div className="p-3 bg-background rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          {t('account.paymentReceipt')}
                        </h4>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewReceipt(order.payment_receipt_url!, order.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('account.viewReceipt')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReceipt(order.payment_receipt_url!, order.id);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t('account.downloadReceipt')}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Invoice */}
                    <div className="p-3 bg-background rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('account.invoice')}
                      </h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(order.id);
                          }}
                          disabled={generatingInvoice === order.id}
                        >
                          {generatingInvoice === order.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {t('account.viewInvoice')}
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(order.id);
                          }}
                          disabled={generatingInvoice === order.id}
                        >
                          {generatingInvoice === order.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          {t('account.downloadInvoice')}
                        </Button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t('account.orderItems')}
                      </h4>
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
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {t('account.paymentReceipt')} - #{selectedReceipt?.orderId.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex items-center justify-center p-4">
              {selectedReceipt.url.includes('.pdf') ? (
                <iframe 
                  src={selectedReceipt.url} 
                  className="w-full h-[70vh] border rounded"
                  title="Receipt PDF"
                />
              ) : (
                <img 
                  src={selectedReceipt.url} 
                  alt="Receipt" 
                  className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;
