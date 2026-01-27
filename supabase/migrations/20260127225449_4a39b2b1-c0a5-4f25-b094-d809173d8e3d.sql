-- Create shipping_zones table for delivery time configuration
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{}',
  min_days INTEGER NOT NULL DEFAULT 1,
  max_days INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shipping zones
CREATE POLICY "Anyone can view active shipping zones"
ON public.shipping_zones
FOR SELECT
USING (is_active = true);

-- Admins can manage shipping zones
CREATE POLICY "Admins can manage shipping zones"
ON public.shipping_zones
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_shipping_zones_updated_at
BEFORE UPDATE ON public.shipping_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default zones
INSERT INTO public.shipping_zones (name, countries, min_days, max_days, sort_order) VALUES
('France métropolitaine', ARRAY['FR'], 3, 7, 1),
('Europe de l''Ouest', ARRAY['BE', 'LU', 'DE', 'NL', 'CH', 'AT', 'IT', 'ES', 'PT'], 5, 10, 2),
('Europe de l''Est', ARRAY['PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI'], 7, 14, 3),
('Royaume-Uni', ARRAY['GB', 'IE'], 7, 14, 4),
('Reste du monde', ARRAY['*'], 14, 30, 5);