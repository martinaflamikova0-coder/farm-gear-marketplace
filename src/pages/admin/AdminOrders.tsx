import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Package, 
  Calendar, 
  Euro, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Eye,
  FileImage,
  Download,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Loader2
} from 'lucide-react';

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
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  notes: string | null;
  order_items: OrderItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; orderId: string } | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        payment_receipt_url,
        shipping_name,
        shipping_email,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        notes,
        order_items (
          id,
          product_title,
          product_price,
          quantity
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive',
      });
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
      });
      fetchOrders();
    }
  };

  const viewReceipt = async (receiptPath: string, orderId: string) => {
    const { data } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 3600); // 1 hour expiry

    if (data?.signedUrl) {
      setSelectedReceipt({ url: data.signedUrl, orderId });
      setReceiptDialogOpen(true);
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le reçu',
        variant: 'destructive',
      });
    }
  };

  const downloadReceipt = async (receiptPath: string, orderId: string) => {
    const { data } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 60);

    if (data?.signedUrl) {
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `receipt-${orderId.slice(0, 8)}.${receiptPath.split('.').pop()}`;
      link.click();
    }
  };

  const handleViewInvoice = async (orderId: string) => {
    try {
      setGeneratingInvoice(orderId);
      const response = await supabase.functions.invoke('generate-invoice', {
        body: { orderId }
      });

      if (response.error) throw response.error;

      const blob = new Blob([response.data], { type: 'application/pdf' });
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

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setGeneratingInvoice(orderId);
      const response = await supabase.functions.invoke('generate-invoice', {
        body: { orderId }
      });

      if (response.error) throw response.error;

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Succès',
        description: 'Facture téléchargée',
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la facture',
        variant: 'destructive',
      });
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-muted-foreground">{orders.length} commande(s) au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="shipped">Expédiée</SelectItem>
            <SelectItem value="delivered">Livrée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.created_at), 'PPP à HH:mm', { locale: fr })}
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                    {order.payment_receipt_url && (
                      <Badge variant="outline" className="gap-1">
                        <FileImage className="h-3 w-3" />
                        Reçu
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{order.shipping_name}</p>
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <Euro className="h-4 w-4" />
                        {order.total_amount.toLocaleString('fr-FR')}
                      </div>
                    </div>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedOrder === order.id && (
                <CardContent className="border-t bg-muted/30 space-y-6">
                  {/* Status Update */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Changer le statut :</span>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="paid">Payée</SelectItem>
                        <SelectItem value="shipped">Expédiée</SelectItem>
                        <SelectItem value="delivered">Livrée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="p-4 bg-background rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informations client
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{order.shipping_name}</p>
                        {order.shipping_email && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {order.shipping_email}
                          </p>
                        )}
                        {order.shipping_phone && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {order.shipping_phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-4 bg-background rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse de livraison
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_postal_code} {order.shipping_city}</p>
                        <p>{order.shipping_country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Receipt */}
                  {order.payment_receipt_url && (
                    <div className="p-4 bg-background rounded-lg space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        Reçu de paiement
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
                          Voir
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
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Invoice */}
                  <div className="p-4 bg-background rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Facture PDF
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
                        Voir
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
                        Télécharger
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Articles commandés
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
                              Quantité : {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {item.product_price.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-4 bg-background rounded-lg">
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Reçu de paiement - #{selectedReceipt?.orderId.slice(0, 8).toUpperCase()}
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

export default AdminOrders;
