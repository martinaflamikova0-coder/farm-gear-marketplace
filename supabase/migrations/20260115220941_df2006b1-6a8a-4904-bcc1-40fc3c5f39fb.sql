-- Create brands table with category association
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Anyone can view brands
CREATE POLICY "Anyone can view brands"
ON public.brands
FOR SELECT
USING (true);

-- Admins can manage brands
CREATE POLICY "Admins can manage brands"
ON public.brands
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial brands for tractors (category_id will be set separately)
INSERT INTO public.brands (name, slug, sort_order) VALUES
('John Deere', 'john-deere', 1),
('Massey Ferguson', 'massey-ferguson', 2),
('New Holland', 'new-holland', 3),
('Fendt', 'fendt', 4),
('Claas', 'claas', 5),
('Case IH', 'case-ih', 6),
('Kubota', 'kubota', 7),
('Deutz-Fahr', 'deutz-fahr', 8),
('Valtra', 'valtra', 9),
('Same', 'same', 10),
('Lamborghini', 'lamborghini', 11),
('JCB', 'jcb', 12),
('Manitou', 'manitou', 13),
('Merlo', 'merlo', 14),
('Caterpillar', 'caterpillar', 15),
('Komatsu', 'komatsu', 16),
('McCormick', 'mccormick', 17),
('Sonalika', 'sonalika', 18);

-- Insert brands for broyeurs/shredders
INSERT INTO public.brands (name, slug, sort_order) VALUES
('Kuhn', 'kuhn', 1),
('Maschio', 'maschio', 2),
('Ferri', 'ferri', 3),
('Seppi', 'seppi', 4),
('Orsi', 'orsi', 5),
('Berti', 'berti', 6),
('Agrimaster', 'agrimaster', 7),
('Perfect', 'perfect', 8),
('Rousseau', 'rousseau', 9),
('Noremat', 'noremat', 10);