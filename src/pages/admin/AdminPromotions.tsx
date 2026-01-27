import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Calendar, Tag, Percent, Euro, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAllPromotions,
  useDeletePromotion,
  type Promotion,
} from '@/hooks/usePromotions';
import PromotionForm from '@/components/admin/PromotionForm';

const AdminPromotions = () => {
  const { t } = useTranslation();
  const { data: promotions, isLoading } = useAllPromotions();
  const deletePromotion = useDeletePromotion();
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getPromotionStatus = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (!promo.is_active) {
      return { label: 'Inactive', variant: 'secondary' as const };
    }
    if (now < start) {
      return { label: 'Programmée', variant: 'outline' as const };
    }
    if (now > end) {
      return { label: 'Expirée', variant: 'destructive' as const };
    }
    return { label: 'Active', variant: 'default' as const };
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const handleDelete = async (id: string) => {
    await deletePromotion.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Gérez les promotions temporaires et les campagnes de réduction
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{promotions?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {promotions?.filter((p) => {
                const now = new Date();
                return (
                  p.is_active &&
                  new Date(p.start_date) <= now &&
                  new Date(p.end_date) >= now
                );
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programmées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {promotions?.filter(
                (p) => p.is_active && new Date(p.start_date) > new Date()
              ).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expirées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              {promotions?.filter((p) => new Date(p.end_date) < new Date())
                .length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune promotion créée
                  </TableCell>
                </TableRow>
              ) : (
                promotions?.map((promo) => {
                  const status = getPromotionStatus(promo);
                  return (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promo.name}</p>
                          {promo.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {promo.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {promo.discount_type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-green-600">
                                -{promo.discount_value}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Euro className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-green-600">
                                -{promo.discount_value}€
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(promo.start_date), 'dd/MM/yyyy')} -{' '}
                            {format(new Date(promo.end_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {promo.applies_to === 'all'
                              ? 'Tous les produits'
                              : promo.applies_to === 'categories'
                              ? `${promo.target_categories.length} catégorie(s)`
                              : `${promo.target_product_ids.length} produit(s)`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{promo.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(promo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Supprimer la promotion ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La promotion "{promo.name}" sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(promo.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </DialogTitle>
          </DialogHeader>
          <PromotionForm
            promotion={editingPromotion}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromotions;
