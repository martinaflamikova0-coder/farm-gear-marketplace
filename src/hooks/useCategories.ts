import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;

export interface CategoryWithCount extends Category {
  count: number;
  subcategories: Category[];
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCategoriesWithCounts = () => {
  const { data: categories = [], ...rest } = useCategories();
  
  const { data: productCounts = {} } = useQuery({
    queryKey: ['product-counts-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Count products per category
      const counts: Record<string, number> = {};
      data.forEach((product) => {
        const cat = product.category;
        counts[cat] = (counts[cat] || 0) + 1;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get parent categories with counts and subcategories
  const parentCategories = categories.filter(c => !c.parent_id);
  
  const categoriesWithCounts: CategoryWithCount[] = parentCategories.map(parent => {
    const subs = categories.filter(c => c.parent_id === parent.id);
    const parentCount = productCounts[parent.slug] || 0;
    const subsCount = subs.reduce((acc, sub) => acc + (productCounts[sub.slug] || 0), 0);
    
    return {
      ...parent,
      count: parentCount + subsCount,
      subcategories: subs,
    };
  });

  return {
    ...rest,
    data: categoriesWithCounts,
    allCategories: categories,
  };
};

// Helper to get parent categories only
export const useParentCategories = () => {
  const { data: categories = [], ...rest } = useCategories();
  return {
    ...rest,
    data: categories.filter(c => !c.parent_id),
  };
};
