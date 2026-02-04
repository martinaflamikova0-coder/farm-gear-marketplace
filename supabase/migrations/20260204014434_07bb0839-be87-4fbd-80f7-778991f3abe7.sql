-- Add bestseller_rank field to products table
ALTER TABLE public.products 
ADD COLUMN bestseller_rank integer DEFAULT NULL;

-- Create index for efficient bestseller queries
CREATE INDEX idx_products_bestseller_rank ON public.products (bestseller_rank) WHERE bestseller_rank IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.products.bestseller_rank IS 'Rank in bestsellers list (1-100). NULL means not a bestseller.';