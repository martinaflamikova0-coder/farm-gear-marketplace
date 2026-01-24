import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaypalSettings {
  id: string;
  client_id: string | null;
  sandbox_mode: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaypalSettings = () => {
  return useQuery({
    queryKey: ['paypal_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_settings' as any)
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as unknown as PaypalSettings;
    },
  });
};

export const useAllPaypalSettings = () => {
  return useQuery({
    queryKey: ['paypal_settings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_settings' as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as unknown as PaypalSettings[];
    },
  });
};

export const useUpdatePaypalSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaypalSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('paypal_settings' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal_settings'] });
    },
  });
};
