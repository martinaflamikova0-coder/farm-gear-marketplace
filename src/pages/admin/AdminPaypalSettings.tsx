import { useState } from 'react';
import { CreditCard, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAllPaypalSettings, useUpdatePaypalSettings, PaypalSettings } from '@/hooks/usePaypalSettings';

const AdminPaypalSettings = () => {
  const { toast } = useToast();
  const { data: paypalSettings, isLoading } = useAllPaypalSettings();
  const updatePaypalSettings = useUpdatePaypalSettings();
  
  const [editingSettings, setEditingSettings] = useState<Record<string, Partial<PaypalSettings>>>({});
  const [showClientId, setShowClientId] = useState(false);

  const handleFieldChange = (settingsId: string, field: keyof PaypalSettings, value: string | boolean | null) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingsId]: {
        ...prev[settingsId],
        [field]: value,
      },
    }));
  };

  const getFieldValue = (settings: PaypalSettings, field: keyof PaypalSettings) => {
    if (editingSettings[settings.id] && editingSettings[settings.id][field] !== undefined) {
      return editingSettings[settings.id][field];
    }
    return settings[field];
  };

  const handleSave = async (settings: PaypalSettings) => {
    const updates = editingSettings[settings.id];
    if (!updates || Object.keys(updates).length === 0) {
      toast({
        title: 'Aucune modification',
        description: 'Aucun changement à enregistrer',
      });
      return;
    }

    try {
      await updatePaypalSettings.mutateAsync({ id: settings.id, ...updates });
      setEditingSettings(prev => {
        const newState = { ...prev };
        delete newState[settings.id];
        return newState;
      });
      toast({
        title: 'Succès',
        description: 'Paramètres PayPal mis à jour',
      });
    } catch (error) {
      console.error('Error updating PayPal settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les paramètres',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Paramètres PayPal</h1>
          <p className="text-muted-foreground mt-1">Gérez l'intégration PayPal pour les paiements</p>
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const settings = paypalSettings?.[0];

  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Paramètres PayPal</h1>
          <p className="text-muted-foreground mt-1">Gérez l'intégration PayPal pour les paiements</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Aucune configuration PayPal trouvée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Paramètres PayPal</h1>
        <p className="text-muted-foreground mt-1">Gérez l'intégration PayPal pour les paiements</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Configuration PayPal</CardTitle>
                <CardDescription>
                  Paramètres de connexion à l'API PayPal
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active" className="text-sm">Actif</Label>
              <Switch
                id="active"
                checked={getFieldValue(settings, 'is_active') as boolean}
                onCheckedChange={(checked) => handleFieldChange(settings.id, 'is_active', checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID</Label>
            <div className="relative">
              <Input
                id="client_id"
                type={showClientId ? 'text' : 'password'}
                value={(getFieldValue(settings, 'client_id') as string) || ''}
                onChange={(e) => handleFieldChange(settings.id, 'client_id', e.target.value)}
                placeholder="Entrez votre Client ID PayPal"
                className="pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowClientId(!showClientId)}
              >
                {showClientId ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Trouvez votre Client ID dans le tableau de bord PayPal Developer
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="sandbox" className="text-base font-medium">Mode Sandbox</Label>
              <p className="text-sm text-muted-foreground">
                Utilisez l'environnement de test PayPal
              </p>
            </div>
            <Switch
              id="sandbox"
              checked={getFieldValue(settings, 'sandbox_mode') as boolean}
              onCheckedChange={(checked) => handleFieldChange(settings.id, 'sandbox_mode', checked)}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={() => handleSave(settings)}
            disabled={updatePaypalSettings.isPending || !editingSettings[settings.id]}
          >
            {updatePaypalSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaypalSettings;
