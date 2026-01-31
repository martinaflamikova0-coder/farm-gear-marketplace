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
  merchant_safe_image_url: string | null;
  merchant_safe_additional_images: string[] | null;
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

export interface ProductsQueryOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  products: ProductWithSeller[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useProducts = (options?: ProductsQueryOptions) => {
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

// New paginated hook for listings page
export const usePaginatedProducts = (options: {
  category?: string;
  search?: string;
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  conditions?: string[];
  sortBy?: string;
  page: number;
  pageSize: number;
}) => {
  return useQuery({
    queryKey: ['products-paginated', options],
    queryFn: async (): Promise<PaginatedProducts> => {
      const { page, pageSize, category, search, brands, priceMin, priceMax, yearMin, yearMax, conditions, sortBy } = options;
      
      // First, get total count with filters
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Apply filters to count query
      if (category) countQuery = countQuery.eq('category', category);
      if (brands && brands.length > 0) countQuery = countQuery.in('brand', brands);
      if (priceMin) countQuery = countQuery.gte('price', priceMin);
      if (priceMax) countQuery = countQuery.lte('price', priceMax);
      if (yearMin) countQuery = countQuery.gte('year', yearMin);
      if (yearMax) countQuery = countQuery.lte('year', yearMax);
      if (conditions && conditions.length > 0) countQuery = countQuery.in('condition', conditions);
      
      if (search) {
        const searchValue = search.trim();
        const refMatch = searchValue.toUpperCase().match(/^REFEQUITRAD0*(\d+)$/);
        const numericMatch = searchValue.match(/^\d+$/);
        
        if (refMatch) {
          countQuery = countQuery.eq('reference_number', parseInt(refMatch[1], 10));
        } else if (numericMatch && searchValue.length <= 5) {
          countQuery = countQuery.eq('reference_number', parseInt(numericMatch[0], 10));
        } else {
          const searchTerm = `%${searchValue}%`;
          countQuery = countQuery.or(`title.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Now get paginated data
      let dataQuery = supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      // Apply same filters
      if (category) dataQuery = dataQuery.eq('category', category);
      if (brands && brands.length > 0) dataQuery = dataQuery.in('brand', brands);
      if (priceMin) dataQuery = dataQuery.gte('price', priceMin);
      if (priceMax) dataQuery = dataQuery.lte('price', priceMax);
      if (yearMin) dataQuery = dataQuery.gte('year', yearMin);
      if (yearMax) dataQuery = dataQuery.lte('year', yearMax);
      if (conditions && conditions.length > 0) dataQuery = dataQuery.in('condition', conditions);
      
      if (search) {
        const searchValue = search.trim();
        const refMatch = searchValue.toUpperCase().match(/^REFEQUITRAD0*(\d+)$/);
        const numericMatch = searchValue.match(/^\d+$/);
        
        if (refMatch) {
          dataQuery = dataQuery.eq('reference_number', parseInt(refMatch[1], 10));
        } else if (numericMatch && searchValue.length <= 5) {
          dataQuery = dataQuery.eq('reference_number', parseInt(numericMatch[0], 10));
        } else {
          const searchTerm = `%${searchValue}%`;
          dataQuery = dataQuery.or(`title.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          dataQuery = dataQuery.order('price', { ascending: true });
          break;
        case 'price-desc':
          dataQuery = dataQuery.order('price', { ascending: false });
          break;
        case 'year-desc':
          dataQuery = dataQuery.order('year', { ascending: false, nullsFirst: false });
          break;
        case 'date-desc':
        default:
          dataQuery = dataQuery.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      if (error) throw error;

      return {
        products: (data as Product[]).map(transformProduct),
        totalCount,
        totalPages,
        currentPage: page,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useProducts({ featured: true });
};

export const useRecentProducts = (limit: number = 4) => {
  return useQuery({
    queryKey: ['products', 'recent', limit],
    queryFn: async () => {
      // Get recent products that are NOT featured to avoid duplication
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('featured', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Product[]).map(transformProduct);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const usePremiumProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'premium', limit],
    queryFn: async () => {
      // Get the most expensive products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Product[]).map(transformProduct);
    },
    staleTime: 2 * 60 * 1000,
  });
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
