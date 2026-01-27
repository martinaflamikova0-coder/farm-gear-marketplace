import { useState } from 'react';
import { useAdminShippingZones, ShippingZone } from '@/hooks/useShippingZones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Truck, Plus, Pencil, Trash2, Globe } from 'lucide-react';

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France', BE: 'Belgique', LU: 'Luxembourg', DE: 'Allemagne', NL: 'Pays-Bas',
  CH: 'Suisse', AT: 'Autriche', IT: 'Italie', ES: 'Espagne', PT: 'Portugal',
  PL: 'Pologne', CZ: 'Tchéquie', SK: 'Slovaquie', HU: 'Hongrie', RO: 'Roumanie',
  BG: 'Bulgarie', HR: 'Croatie', SI: 'Slovénie', GB: 'Royaume-Uni', IE: 'Irlande',
  '*': 'Reste du monde'
};

const AdminShippingZones = () => {
  const { toast } = useToast();
  const { zones, isLoading, createZone, updateZone, deleteZone } = useAdminShippingZones();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    countries: '',
    min_days: 1,
    max_days: 5,
    is_active: true,
    sort_order: 0,
  });

  const openCreateDialog = () => {
    setEditingZone(null);
    setFormData({ name: '', countries: '', min_days: 1, max_days: 5, is_active: true, sort_order: zones.length });
    setDialogOpen(true);
  };

  const openEditDialog = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      countries: zone.countries.join(', '),
      min_days: zone.min_days,
      max_days: zone.max_days,
      is_active: zone.is_active,
      sort_order: zone.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const countriesArray = formData.countries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
    
    if (!formData.name || countriesArray.length === 0) {
      toast({ title: 'Erreur', description: 'Nom et pays requis', variant: 'destructive' });
      return;
    }

    try {
      if (editingZone) {
        await updateZone.mutateAsync({
          id: editingZone.id,
          name: formData.name,
          countries: countriesArray,
          min_days: formData.min_days,
          max_days: formData.max_days,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        });
        toast({ title: 'Succès', description: 'Zone modifiée' });
      } else {
        await createZone.mutateAsync({
          name: formData.name,
          countries: countriesArray,
          min_days: formData.min_days,
          max_days: formData.max_days,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        });
        toast({ title: 'Succès', description: 'Zone créée' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette zone ?')) return;
    try {
      await deleteZone.mutateAsync(id);
      toast({ title: 'Succès', description: 'Zone supprimée' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const toggleActive = async (zone: ShippingZone) => {
    try {
      await updateZone.mutateAsync({ id: zone.id, is_active: !zone.is_active });
      toast({ title: 'Succès', description: `Zone ${zone.is_active ? 'désactivée' : 'activée'}` });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de modifier', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Zones de livraison</h1>
          <p className="text-muted-foreground">Gérez les délais de livraison par zone géographique</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingZone ? 'Modifier la zone' : 'Nouvelle zone'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom de la zone</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Europe de l'Ouest"
                />
              </div>
              <div>
                <Label>Codes pays (séparés par des virgules)</Label>
                <Input
                  value={formData.countries}
                  onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                  placeholder="Ex: FR, BE, DE ou * pour le reste du monde"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Utilisez les codes ISO (FR, DE, ES...) ou * pour le reste du monde
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Délai minimum (jours)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.min_days}
                    onChange={(e) => setFormData({ ...formData, min_days: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Délai maximum (jours)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.max_days}
                    onChange={(e) => setFormData({ ...formData, max_days: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Zone active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={createZone.isPending || updateZone.isPending}>
                {editingZone ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune zone configurée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {zone.name}
                      {!zone.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {zone.min_days}-{zone.max_days} jours ouvrés
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={() => toggleActive(zone)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(zone)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {zone.countries.map((code) => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {COUNTRY_NAMES[code] || code}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminShippingZones;
