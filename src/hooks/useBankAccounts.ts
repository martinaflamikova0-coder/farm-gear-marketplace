import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BankAccount {
  id: string;
  account_key: string;
  name: string;
  bank_name: string;
  iban: string;
  bic: string;
  holder: string;
  threshold_min: number | null;
  threshold_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBankAccountForAmount = (amount: number) => {
  return useQuery({
    queryKey: ['bank_account_for_amount', amount],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_bank_account_for_amount', { order_amount: amount });

      if (error) throw error;
      return (data?.[0] as BankAccount) || null;
    },
    enabled: amount > 0,
  });
};

export const useAllBankAccounts = () => {
  return useQuery({
    queryKey: ['bank_accounts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('account_key', { ascending: true });

      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
    },
  });
};

export const getBankAccountForAmount = (accounts: BankAccount[], amount: number): BankAccount | null => {
  if (!accounts || accounts.length === 0) return null;
  
  return accounts.find(acc => 
    amount >= (acc.threshold_min || 0) && 
    (acc.threshold_max === null || amount <= acc.threshold_max)
  ) || accounts[0];
};
