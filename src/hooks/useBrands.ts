import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  logo_url: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const useBrands = (categoryId?: string) => {
  return useQuery({
    queryKey: ['brands', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (categoryId) {
        // Get brands for specific category OR brands with no category (global brands)
        query = query.or(`category_id.eq.${categoryId},category_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Brand[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAllBrands = () => {
  return useQuery({
    queryKey: ['brands', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Brand[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get unique brand names for filtering (no category filtering)
export const useBrandNames = () => {
  return useQuery({
    queryKey: ['brands', 'names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Get unique names
      const uniqueNames = [...new Set(data.map(b => b.name))];
      return uniqueNames;
    },
    staleTime: 5 * 60 * 1000,
  });
};
