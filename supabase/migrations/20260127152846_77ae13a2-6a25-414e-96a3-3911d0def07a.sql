-- Create promotions table for time-limited promotional campaigns
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'categories', 'products')),
  target_categories TEXT[] DEFAULT '{}',
  target_product_ids UUID[] DEFAULT '{}',
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_percentage CHECK (discount_type != 'percentage' OR discount_value <= 100)
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read of active promotions
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true AND start_date <= now() AND end_date >= now());

-- Create policy for admin management
CREATE POLICY "Admins can manage promotions"
ON public.promotions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient date-based queries
CREATE INDEX idx_promotions_active_dates ON public.promotions (is_active, start_date, end_date);
CREATE INDEX idx_promotions_target_categories ON public.promotions USING GIN (target_categories);
CREATE INDEX idx_promotions_target_products ON public.promotions USING GIN (target_product_ids);