import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  content: string;
  content_translations: Record<string, string> | null;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TranslatedTestimonial extends Omit<Testimonial, 'content'> {
  content: string;
}

export const useTestimonials = (featured?: boolean) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return useQuery({
    queryKey: ['testimonials', featured, currentLang],
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

      // Keep original content in the author's native language
      const testimonials = (data || []).map((testimonial: any): TranslatedTestimonial => ({
        ...testimonial,
        content: testimonial.content,
      }));

      return testimonials;
    },
  });
};

export const useFeaturedTestimonials = () => {
  return useTestimonials(true);
};
