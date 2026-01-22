import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  author_company: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTestimonials = (featured?: boolean) => {
  return useQuery({
    queryKey: ['testimonials', featured],
    queryFn: async () => {
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useFeaturedTestimonials = () => {
  return useTestimonials(true);
};
