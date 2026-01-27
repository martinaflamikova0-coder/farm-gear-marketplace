-- Create translation columns for testimonials
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS content_translations jsonb DEFAULT '{}'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_featured_active 
ON public.testimonials (is_featured, is_active) 
WHERE is_active = true;