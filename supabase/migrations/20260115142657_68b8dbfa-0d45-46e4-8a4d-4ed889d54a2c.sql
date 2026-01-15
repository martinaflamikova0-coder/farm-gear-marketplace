-- Add a reference number column to products
ALTER TABLE public.products 
ADD COLUMN reference_number SERIAL;

-- Create a unique index on reference_number
CREATE UNIQUE INDEX idx_products_reference_number ON public.products(reference_number);

-- Update existing products to have sequential reference numbers based on creation date
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.products
)
UPDATE public.products p
SET reference_number = n.rn
FROM numbered n
WHERE p.id = n.id;