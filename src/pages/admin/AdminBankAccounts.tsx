import { useState } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAllBankAccounts, useUpdateBankAccount, BankAccount } from '@/hooks/useBankAccounts';

const AdminBankAccounts = () => {
  const { toast } = useToast();
  const { data: bankAccounts, isLoading } = useAllBankAccounts();
  const updateBankAccount = useUpdateBankAccount();
  
  const [editingAccounts, setEditingAccounts] = useState<Record<string, Partial<BankAccount>>>({});

  const handleFieldChange = (accountId: string, field: keyof BankAccount, value: string | number | boolean | null) => {
    setEditingAccounts(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [field]: value,
      },
    }));
  };

  const getFieldValue = (account: BankAccount, field: keyof BankAccount) => {
    if (editingAccounts[account.id] && editingAccounts[account.id][field] !== undefined) {
      return editingAccounts[account.id][field];
    }
    return account[field];
  };

  const handleSave = async (account: BankAccount) => {
    const updates = editingAccounts[account.id];
    if (!updates || Object.keys(updates).length === 0) {
      toast({
        title: 'Aucune modification',
        description: 'Aucun changement à enregistrer',
      });
      return;
    }

    try {
      await updateBankAccount.mutateAsync({ id: account.id, ...updates });
      setEditingAccounts(prev => {
        const newState = { ...prev };
        delete newState[account.id];
        return newState;
      });
      toast({
        title: 'Succès',
        description: 'Compte bancaire mis à jour',
      });
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le compte',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Comptes bancaires</h1>
          <p className="text-muted-foreground mt-1">Gérez les coordonnées bancaires pour les paiements</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Comptes bancaires</h1>
        <p className="text-muted-foreground mt-1">Gérez les coordonnées bancaires pour les paiements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {bankAccounts?.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      {account.account_key === 'account_a' ? 'Compte A (petits montants)' : 'Compte B (grands montants)'}
                    </CardTitle>
                    <CardDescription>
                      {account.account_key === 'account_a' 
                        ? `Utilisé pour les commandes < ${account.threshold_max || 5000}€`
                        : `Utilisé pour les commandes ≥ ${account.threshold_min || 5000}€`
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${account.id}`} className="text-sm">Actif</Label>
                  <Switch
                    id={`active-${account.id}`}
                    checked={getFieldValue(account, 'is_active') as boolean}
                    onCheckedChange={(checked) => handleFieldChange(account.id, 'is_active', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${account.id}`}>Nom du compte</Label>
                <Input
                  id={`name-${account.id}`}
                  value={getFieldValue(account, 'name') as string}
                  onChange={(e) => handleFieldChange(account.id, 'name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`bank-${account.id}`}>Nom de la banque</Label>
                <Input
                  id={`bank-${account.id}`}
                  value={getFieldValue(account, 'bank_name') as string}
                  onChange={(e) => handleFieldChange(account.id, 'bank_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`holder-${account.id}`}>Titulaire du compte</Label>
                <Input
                  id={`holder-${account.id}`}
                  value={getFieldValue(account, 'holder') as string}
                  onChange={(e) => handleFieldChange(account.id, 'holder', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`iban-${account.id}`}>IBAN</Label>
                <Input
                  id={`iban-${account.id}`}
                  value={getFieldValue(account, 'iban') as string}
                  onChange={(e) => handleFieldChange(account.id, 'iban', e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`bic-${account.id}`}>BIC</Label>
                <Input
                  id={`bic-${account.id}`}
                  value={getFieldValue(account, 'bic') as string}
                  onChange={(e) => handleFieldChange(account.id, 'bic', e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`min-${account.id}`}>Seuil minimum (€)</Label>
                  <Input
                    id={`min-${account.id}`}
                    type="number"
                    value={getFieldValue(account, 'threshold_min') as number || 0}
                    onChange={(e) => handleFieldChange(account.id, 'threshold_min', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`max-${account.id}`}>Seuil maximum (€)</Label>
                  <Input
                    id={`max-${account.id}`}
                    type="number"
                    placeholder="Illimité"
                    value={(getFieldValue(account, 'threshold_max') as number | null) || ''}
                    onChange={(e) => handleFieldChange(account.id, 'threshold_max', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleSave(account)}
                disabled={updateBankAccount.isPending || !editingAccounts[account.id]}
              >
                {updateBankAccount.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBankAccounts;
