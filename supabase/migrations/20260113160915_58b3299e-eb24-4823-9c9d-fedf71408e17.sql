-- Add JSON columns for multilingual title and description
ALTER TABLE public.products 
ADD COLUMN title_translations jsonb DEFAULT '{}'::jsonb,
ADD COLUMN description_translations jsonb DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.products.title_translations IS 'JSON object with language codes as keys: {"en": "...", "fr": "...", "de": "...", etc.}';
COMMENT ON COLUMN public.products.description_translations IS 'JSON object with language codes as keys: {"en": "...", "fr": "...", "de": "...", etc.}';