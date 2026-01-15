-- Add stock column for new items
ALTER TABLE public.products 
ADD COLUMN stock integer DEFAULT NULL;

-- Add low_stock_threshold column for alerts
ALTER TABLE public.products 
ADD COLUMN low_stock_threshold integer DEFAULT 5;

COMMENT ON COLUMN public.products.stock IS 'Stock quantity for new items. NULL for used/refurbished items (unique pieces)';
COMMENT ON COLUMN public.products.low_stock_threshold IS 'Threshold for low stock alerts in admin dashboard';