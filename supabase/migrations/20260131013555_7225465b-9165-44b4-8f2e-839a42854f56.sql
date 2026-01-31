-- Add language column to orders table to track customer's language preference
ALTER TABLE public.orders ADD COLUMN language TEXT DEFAULT 'fr';

-- Add a comment explaining the purpose
COMMENT ON COLUMN public.orders.language IS 'Customer language preference at time of order (ISO 639-1 code: en, fr, de, es, it, pt)';