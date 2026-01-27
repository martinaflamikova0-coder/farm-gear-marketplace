import { useState } from 'react';
import { Truck, Euro, Send, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShippingCostManagerProps {
  orderId: string;
  currentCost: number | null;
  isNotified: boolean;
  customerEmail: string | null;
  orderTotal: number;
  onUpdate: () => void;
}

const FREE_SHIPPING_LIMIT = 150;

const ShippingCostManager = ({
  orderId,
  currentCost,
  isNotified,
  customerEmail,
  orderTotal,
  onUpdate,
}: ShippingCostManagerProps) => {
  const { toast } = useToast();
  const [cost, setCost] = useState<string>(currentCost?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const numericCost = parseFloat(cost) || 0;
  const supplement = Math.max(0, numericCost - FREE_SHIPPING_LIMIT);

  const handleSave = async () => {
    if (!cost || numericCost < 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          shipping_cost: numericCost,
          shipping_cost_notified: false // Reset notification status when cost changes
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Frais enregistrés',
        description: `Frais de transport: ${numericCost}€ (supplément client: ${supplement}€)`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving shipping cost:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les frais',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifyCustomer = async () => {
    if (!customerEmail) {
      toast({
        title: 'Erreur',
        description: 'Aucune adresse email client',
        variant: 'destructive',
      });
      return;
    }

    if (numericCost <= FREE_SHIPPING_LIMIT) {
      toast({
        title: 'Information',
        description: 'Aucun supplément à notifier (frais ≤ 150€)',
      });
      return;
    }

    setIsNotifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-shipping-cost`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            orderId,
            customerEmail,
            shippingCost: numericCost,
            supplement,
            orderTotal,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send notification');
      }

      // Mark as notified in database
      await supabase
        .from('orders')
        .update({ shipping_cost_notified: true })
        .eq('id', orderId);

      toast({
        title: 'Client notifié',
        description: `Email envoyé à ${customerEmail}`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error notifying customer:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'envoyer la notification',
        variant: 'destructive',
      });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="p-4 bg-background rounded-lg space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Truck className="h-4 w-4" />
        Frais de transport
      </h4>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Cost input */}
        <div className="space-y-2">
          <Label htmlFor="shipping-cost">Coût réel de la livraison (€)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="shipping-cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Ex: 250"
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="icon"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Calculation summary */}
        <div className="space-y-2">
          <Label>Récapitulatif</Label>
          <div className="text-sm space-y-1 p-3 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Offert par l'entreprise:</span>
              <span className="text-success font-medium">
                {Math.min(numericCost, FREE_SHIPPING_LIMIT)}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">À charge du client:</span>
              <span className={`font-medium ${supplement > 0 ? 'text-destructive' : 'text-success'}`}>
                {supplement}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification status and button */}
      {currentCost !== null && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {isNotified ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <Check className="h-3 w-3 mr-1" />
                Client notifié
              </Badge>
            ) : supplement > 0 ? (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                En attente de notification
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted">
                Pas de supplément
              </Badge>
            )}
          </div>

          {supplement > 0 && !isNotified && customerEmail && (
            <Button 
              onClick={handleNotifyCustomer} 
              disabled={isNotifying}
              variant="outline"
              size="sm"
            >
              {isNotifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Notifier le client
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingCostManager;
