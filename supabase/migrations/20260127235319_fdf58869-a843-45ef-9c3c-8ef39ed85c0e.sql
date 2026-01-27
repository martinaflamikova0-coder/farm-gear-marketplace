-- Add shipping_cost column to orders table for actual shipping costs entered by admin
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT NULL;

-- Add column for whether shipping cost notification was sent
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_cost_notified boolean DEFAULT false;

-- Create index for faster queries on shipping cost status
CREATE INDEX IF NOT EXISTS idx_orders_shipping_cost ON public.orders (shipping_cost) WHERE shipping_cost IS NOT NULL;