import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  applies_to: 'all' | 'categories' | 'products';
  target_categories: string[];
  target_product_ids: string[];
  min_price: number | null;
  max_price: number | null;
  created_at: string;
  updated_at: string;
}

export type PromotionInsert = Omit<Promotion, 'id' | 'created_at' | 'updated_at'>;
export type PromotionUpdate = Partial<PromotionInsert>;

// Fetch all promotions (admin view - includes inactive and expired)
export const useAllPromotions = () => {
  return useQuery({
    queryKey: ['promotions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
};

// Fetch only active promotions (for public display)
export const useActivePromotions = () => {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create promotion
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: PromotionInsert) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promotion)
        .select()
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating promotion:', error);
      toast.error('Erreur lors de la création de la promotion');
    },
  });
};

// Update promotion
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PromotionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion mise à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating promotion:', error);
      toast.error('Erreur lors de la mise à jour de la promotion');
    },
  });
};

// Delete promotion
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion supprimée avec succès');
    },
    onError: (error) => {
      console.error('Error deleting promotion:', error);
      toast.error('Erreur lors de la suppression de la promotion');
    },
  });
};

// Helper function to check if a promotion applies to a product
export const doesPromotionApply = (
  promotion: Promotion,
  product: { id: string; category: string; price: number }
): boolean => {
  // Check price constraints
  if (promotion.min_price !== null && product.price < promotion.min_price) {
    return false;
  }
  if (promotion.max_price !== null && product.price > promotion.max_price) {
    return false;
  }

  // Check target
  switch (promotion.applies_to) {
    case 'all':
      return true;
    case 'categories':
      return promotion.target_categories.includes(product.category);
    case 'products':
      return promotion.target_product_ids.includes(product.id);
    default:
      return false;
  }
};

// Calculate promotional price
export const calculatePromotionalPrice = (
  price: number,
  promotion: Promotion
): number => {
  if (promotion.discount_type === 'percentage') {
    return price * (1 - promotion.discount_value / 100);
  } else {
    return Math.max(0, price - promotion.discount_value);
  }
};

// Get the best applicable promotion for a product
export const getBestPromotion = (
  promotions: Promotion[],
  product: { id: string; category: string; price: number }
): Promotion | null => {
  const applicablePromotions = promotions.filter((promo) =>
    doesPromotionApply(promo, product)
  );

  if (applicablePromotions.length === 0) return null;

  // Sort by priority (highest first), then by discount value
  return applicablePromotions.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // Compare effective discount
    const discountA =
      a.discount_type === 'percentage'
        ? product.price * (a.discount_value / 100)
        : a.discount_value;
    const discountB =
      b.discount_type === 'percentage'
        ? product.price * (b.discount_value / 100)
        : b.discount_value;
    return discountB - discountA;
  })[0];
};
