import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

export interface ProductWithSeller extends Product {
  seller: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  customer_images: string[] | null;
}

// Transform database product to include seller object for compatibility
const transformProduct = (product: Product): ProductWithSeller => ({
  ...product,
  seller: {
    name: product.seller_name,
    phone: product.seller_phone,
    email: product.seller_email,
  },
});

export const useProducts = (options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.search) {
        const searchValue = options.search.trim();
        
        // Check if searching by reference number (REFEQUITRAD format or just number)
        const refMatch = searchValue.toUpperCase().match(/^REFEQUITRAD0*(\d+)$/);
        const numericMatch = searchValue.match(/^\d+$/);
        
        if (refMatch) {
          // Search by exact reference number from REFEQUITRAD format
          const refNumber = parseInt(refMatch[1], 10);
          query = query.eq('reference_number', refNumber);
        } else if (numericMatch && searchValue.length <= 5) {
          // If it's just a number (up to 5 digits), could be a reference number
          const refNumber = parseInt(numericMatch[0], 10);
          query = query.eq('reference_number', refNumber);
        } else {
          // Regular text search
          const searchTerm = `%${searchValue}%`;
          query = query.or(`title.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as Product[]).map(transformProduct);
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

export const useFeaturedProducts = () => {
  return useProducts({ featured: true });
};

export const useRecentProducts = (limit: number = 4) => {
  return useProducts({ limit });
};

export const useProductById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return transformProduct(data as Product);
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useProducts({ category: categorySlug });
};
