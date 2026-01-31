import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  useMerchantCenterSettingsRaw,
  useUpdateMerchantCenterSetting,
  useBatchUpdateMerchantCenterSettings,
  STRICT_MC_CONFIG,
  DEFAULT_MARKETPLACE_CONFIG,
  type MerchantCenterSetting,
  type PriceDisplayMode,
} from '@/hooks/useMerchantCenterSettings';
import { WatermarkScanner } from '@/components/admin/WatermarkScanner';
import {
  Store,
  Image,
  LayoutGrid,
  DollarSign,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Zap,
  RotateCcw,
} from 'lucide-react';

// Group settings by category for display
const CATEGORY_CONFIG = {
  global: {
    title: 'Global',
    description: 'Activation générale du mode Merchant Center',
    icon: Store,
  },
  images: {
    title: 'Images',
    description: 'Règles pour les images produits (interdits par Google)',
    icon: Image,
  },
  cards: {
    title: 'Cartes / Listings',
    description: 'Affichage simplifié pour éviter les captures "marketplace"',
    icon: LayoutGrid,
  },
  pricing: {
    title: 'Prix & TVA',
    description: 'Affichage des prix conformément aux exigences Google',
    icon: DollarSign,
  },
  product_page: {
    title: 'Page Produit',
    description: 'Optimisations de la fiche produit',
    icon: FileText,
  },
  quality: {
    title: 'Qualité Site',
    description: 'Éviter les refus pour "site à améliorer"',
    icon: Shield,
  },
};

const AdminMerchantCenter = () => {
  const { toast } = useToast();
  const { data: settings, isLoading, refetch } = useMerchantCenterSettingsRaw();
  const updateSetting = useUpdateMerchantCenterSetting();
  const batchUpdate = useBatchUpdateMerchantCenterSettings();
  
  // Count products without merchant-safe images
  const { data: riskStats } = useQuery({
    queryKey: ['mc-risk-stats'],
    queryFn: async () => {
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: atRiskProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('merchant_safe_image_url', null);

      return {
        total: totalProducts || 0,
        atRisk: atRiskProducts || 0,
        safe: (totalProducts || 0) - (atRiskProducts || 0),
      };
    },
  });

  const handleToggle = async (key: string, currentValue: boolean | string) => {
    try {
      await updateSetting.mutateAsync({ 
        key, 
        value: typeof currentValue === 'boolean' ? !currentValue : currentValue 
      });
      toast({
        title: 'Paramètre mis à jour',
        description: `${key} a été ${!currentValue ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le paramètre',
        variant: 'destructive',
      });
    }
  };

  const handlePriceModeChange = async (value: PriceDisplayMode) => {
    try {
      await updateSetting.mutateAsync({ key: 'mc_price_display_mode', value });
      toast({
        title: 'Mode de prix mis à jour',
        description: `Affichage en ${value === 'TTC_only' ? 'TTC uniquement' : 'HT uniquement'}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le mode de prix',
        variant: 'destructive',
      });
    }
  };

  const handleApplyStrictConfig = async () => {
    try {
      await batchUpdate.mutateAsync(STRICT_MC_CONFIG);
      toast({
        title: 'Configuration stricte appliquée',
        description: 'Tous les paramètres Merchant Center ont été activés',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'appliquer la configuration',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreMarketplace = async () => {
    try {
      await batchUpdate.mutateAsync(DEFAULT_MARKETPLACE_CONFIG);
      toast({
        title: 'Mode marketplace restauré',
        description: 'Tous les paramètres Merchant Center ont été désactivés',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de restaurer la configuration',
        variant: 'destructive',
      });
    }
  };

  // Group settings by category
  const settingsByCategory = (settings || []).reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, MerchantCenterSetting[]>);

  const isMcEnabled = settings?.find(s => s.key === 'mc_enabled')?.value === true;
  const priceMode = settings?.find(s => s.key === 'mc_price_display_mode')?.value as PriceDisplayMode || 'TTC_only';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Merchant Center Compliance
          </h1>
          <p className="text-muted-foreground">
            Configurez votre site pour la conformité Google Merchant Center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Risk Detection Alert */}
      {riskStats && riskStats.atRisk > 0 && isMcEnabled && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Produits à risque détectés</AlertTitle>
          <AlertDescription>
            <strong>{riskStats.atRisk}</strong> produits sur {riskStats.total} n'ont pas d'image Merchant-safe configurée. 
            Ces produits peuvent être rejetés par Google.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mode MC</p>
                <p className="text-2xl font-bold">
                  {isMcEnabled ? (
                    <span className="text-success flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Actif
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Inactif</span>
                  )}
                </p>
              </div>
              <Badge variant={isMcEnabled ? 'default' : 'secondary'}>
                {isMcEnabled ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produits conformes</p>
                <p className="text-2xl font-bold text-success">
                  {riskStats?.safe || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produits à risque</p>
                <p className="text-2xl font-bold text-destructive">
                  {riskStats?.atRisk || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Appliquez une configuration prédéfinie en un clic
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            onClick={handleApplyStrictConfig}
            disabled={batchUpdate.isPending}
            className="gap-2"
          >
            {batchUpdate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Appliquer configuration stricte Merchant Center
          </Button>
          <Button 
            variant="outline"
            onClick={handleRestoreMarketplace}
            disabled={batchUpdate.isPending}
            className="gap-2"
          >
            {batchUpdate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Restaurer mode marketplace
          </Button>
        </CardContent>
      </Card>

      {/* Watermark Detection */}
      <WatermarkScanner />

      {/* Settings by Category */}
      {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
        const categorySettings = settingsByCategory[categoryKey] || [];
        if (categorySettings.length === 0) return null;

        const Icon = config.icon;

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {config.title}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map((setting, index) => (
                <div key={setting.key}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label 
                        htmlFor={setting.key} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {setting.key}
                      </Label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    {setting.key === 'mc_price_display_mode' ? (
                      <Select 
                        value={priceMode} 
                        onValueChange={(v) => handlePriceModeChange(v as PriceDisplayMode)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TTC_only">TTC uniquement</SelectItem>
                          <SelectItem value="HT_only">HT uniquement</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Switch
                        id={setting.key}
                        checked={setting.value === true}
                        onCheckedChange={() => handleToggle(setting.key, setting.value)}
                        disabled={updateSetting.isPending}
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Aide & Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Mode Merchant Center (mc_enabled):</strong> Active l'ensemble des règles de conformité pour Google Merchant Center.
          </p>
          <p>
            <strong>Images Merchant-safe:</strong> Chaque produit peut avoir une image alternative "propre" sans texte, badge, ou overlay. 
            Configurez-la dans le formulaire d'édition de produit.
          </p>
          <p>
            <strong>Configuration stricte:</strong> Active tous les paramètres recommandés pour maximiser les chances d'approbation sur Google Merchant Center.
          </p>
          <p>
            <strong>Mode marketplace:</strong> Restaure l'affichage standard de la marketplace avec tous les badges, remises et informations visibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMerchantCenter;
