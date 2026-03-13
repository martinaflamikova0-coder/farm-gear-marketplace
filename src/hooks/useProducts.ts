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

// The public view excludes seller_email and seller_phone for security
type ProductPublicRow = Tables<'products_public'>;

// Transform public view row to ProductWithSeller (seller contact is masked)
const transformPublicProduct = (row: ProductPublicRow): ProductWithSeller => ({
  // Map nullable view fields to required Product fields with safe defaults
  id: row.id!,
  title: row.title || '',
  price: row.price || 0,
  category: row.category || '',
  reference_number: row.reference_number || 0,
  created_at: row.created_at || new Date().toISOString(),
  updated_at: row.updated_at || new Date().toISOString(),
  // Nullable fields pass through
  brand: row.brand,
  model: row.model,
  year: row.year,
  hours: row.hours,
  kilometers: row.kilometers,
  condition: row.condition,
  location: row.location,
  department: row.department,
  description: row.description,
  description_translations: row.description_translations,
  title_translations: row.title_translations,
  images: row.images,
  featured: row.featured,
  status: row.status,
  stock: row.stock,
  low_stock_threshold: row.low_stock_threshold,
  original_price: row.original_price,
  discount_percentage: row.discount_percentage,
  bestseller_rank: row.bestseller_rank,
  price_type: row.price_type,
  subcategory: row.subcategory,
  created_by: row.created_by,
  customer_images: row.customer_images,
  merchant_safe_image_url: row.merchant_safe_image_url,
  merchant_safe_additional_images: row.merchant_safe_additional_images,
  seller_name: row.seller_name || null,
  // These are masked by the view - always null for public access
  seller_phone: null,
  seller_email: null,
  // Seller object
  seller: {
    name: row.seller_name || null,
    phone: null,
    email: null,
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
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .lte('price', 50000)
        .order('price', { ascending: true });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.search) {
        const searchValue = options.search.trim();
        const refMatch = searchValue.toUpperCase().match(/^REFEQUITRAD0*(\d+)$/);
        const numericMatch = searchValue.match(/^\d+$/);
        
        if (refMatch) {
          const refNumber = parseInt(refMatch[1], 10);
          query = query.eq('reference_number', refNumber);
        } else if (numericMatch && searchValue.length <= 5) {
          const refNumber = parseInt(numericMatch[0], 10);
          query = query.eq('reference_number', refNumber);
        } else {
          const searchTerm = `%${searchValue}%`;
          query = query.or(`title.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as ProductPublicRow[]).map(transformPublicProduct);
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Paginated hook for listings page
export const usePaginatedProducts = (options: {
  category?: string;
  search?: string;
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  conditions?: string[];
  featured?: boolean;
  sortBy?: string;
  page: number;
  pageSize: number;
}) => {
  return useQuery({
    queryKey: ['products-paginated', options],
    queryFn: async (): Promise<PaginatedProducts> => {
      const { page, pageSize, category, search, brands, priceMin, priceMax, yearMin, yearMax, conditions, featured, sortBy } = options;
      
      // First, get total count with filters
      let countQuery = supabase
        .from('products_public')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('price', 50000);

      if (featured) countQuery = countQuery.eq('featured', true);
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
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .lte('price', 50000);

      if (featured) dataQuery = dataQuery.eq('featured', true);
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

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      if (error) throw error;

      return {
        products: (data as ProductPublicRow[]).map(transformPublicProduct),
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
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .eq('featured', false)
        .order('price', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data as ProductPublicRow[]).map(transformPublicProduct);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const usePremiumProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'premium', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as ProductPublicRow[]).map(transformPublicProduct);
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
        .from('products_public')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return transformPublicProduct(data as ProductPublicRow);
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useProducts({ category: categorySlug });
};

export const useBestSellers = (limit: number = 100) => {
  return useQuery({
    queryKey: ['products', 'bestsellers', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data as ProductPublicRow[]).map(transformPublicProduct);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useLatestProducts = (excludeIds: string[] = [], limit: number = 100) => {
  return useQuery({
    queryKey: ['products', 'latest-chantier', excludeIds.length, limit],
    queryFn: async () => {
      let query = supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .eq('category', 'chantier')
        .not('subcategory', 'is', null)
        .order('price', { ascending: true })
        .limit(limit + excludeIds.length); // fetch extra to compensate for exclusions

      const { data, error } = await query;
      if (error) throw error;
      
      const excludeSet = new Set(excludeIds);
      const filtered = (data as ProductPublicRow[])
        .map(transformPublicProduct)
        .filter(p => !excludeSet.has(p.id))
        .slice(0, limit);
      
      return filtered;
    },
    staleTime: 2 * 60 * 1000,
    enabled: excludeIds.length > 0 || true,
  });
};
