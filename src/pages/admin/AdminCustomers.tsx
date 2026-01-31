import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone, MapPin, ShoppingCart, FileText, Receipt, ChevronDown, ChevronUp, ExternalLink, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CustomerWithOrders {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  orders: {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_name: string | null;
    shipping_email: string | null;
    shipping_address: string | null;
    shipping_city: string | null;
    payment_receipt_url: string | null;
    language: string | null;
    items: {
      id: string;
      product_title: string;
      product_price: number;
      quantity: number;
    }[];
  }[];
  total_orders: number;
  total_spent: number;
}

const AdminCustomers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Fetch all orders with items grouped by user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          created_at,
          status,
          total_amount,
          shipping_name,
          shipping_email,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_postal_code,
          shipping_country,
          payment_receipt_url,
          language,
          order_items (
            id,
            product_title,
            product_price,
            quantity
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Group orders by user
      const customerMap = new Map<string, CustomerWithOrders>();

      orders?.forEach((order: any) => {
        const userId = order.user_id;
        const profile = profiles?.find(p => p.user_id === userId);
        
        if (!customerMap.has(userId)) {
          customerMap.set(userId, {
            user_id: userId,
            email: profile?.email || order.shipping_email,
            full_name: profile?.full_name || order.shipping_name,
            phone: profile?.phone || order.shipping_phone,
            address: profile?.address || order.shipping_address,
            city: profile?.city || order.shipping_city,
            postal_code: profile?.postal_code || order.shipping_postal_code,
            country: profile?.country || order.shipping_country,
            orders: [],
            total_orders: 0,
            total_spent: 0,
          });
        }

        const customer = customerMap.get(userId)!;
        customer.orders.push({
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          total_amount: order.total_amount,
          shipping_name: order.shipping_name,
          shipping_email: order.shipping_email,
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city,
          payment_receipt_url: order.payment_receipt_url,
          language: order.language || 'fr',
          items: order.order_items || [],
        });
        customer.total_orders += 1;
        customer.total_spent += Number(order.total_amount);
      });

      return Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleViewReceipt = async (receiptPath: string) => {
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 3600);

    if (data && !error) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleViewInvoice = async (orderId: string, language: string = 'fr') => {
    try {
      setGeneratingInvoice(orderId);
      
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ orderId, language }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate invoice');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer la facture',
        variant: 'destructive',
      });
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.email?.toLowerCase().includes(search) ||
      customer.full_name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.city?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Gérez vos clients et leurs commandes</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">{customers.length} clients au total</p>
        </div>
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Collapsible
            key={customer.user_id}
            open={expandedCustomer === customer.user_id}
            onOpenChange={(open) => setExpandedCustomer(open ? customer.user_id : null)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {customer.full_name || customer.email || 'Client anonyme'}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}, {customer.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">{formatPrice(customer.total_spent)}</p>
                        <p className="text-sm text-muted-foreground">{customer.total_orders} commande{customer.total_orders > 1 ? 's' : ''}</p>
                      </div>
                      {expandedCustomer === customer.user_id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {customer.address && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse de livraison
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {customer.address}<br />
                        {customer.postal_code} {customer.city}<br />
                        {customer.country}
                      </p>
                    </div>
                  )}

                  <h4 className="font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Historique des commandes
                  </h4>

                  <div className="space-y-3">
                    {customer.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                          </div>
                        </div>

                        <div className="space-y-1 mb-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.product_title.substring(0, 50)}...
                              </span>
                              <span>{formatPrice(item.product_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                          {order.payment_receipt_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReceipt(order.payment_receipt_url!)}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Reçu
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(order.id, order.language || 'fr')}
                            disabled={generatingInvoice === order.id}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Facture
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun client trouvé
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
