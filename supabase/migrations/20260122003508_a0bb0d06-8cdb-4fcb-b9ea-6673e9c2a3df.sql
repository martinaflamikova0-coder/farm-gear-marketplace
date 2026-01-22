-- 1. Add discount columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Update existing products: set original_price = price, calculate discount based on price tier
UPDATE public.products SET 
  original_price = price,
  discount_percentage = CASE 
    WHEN price >= 100000 THEN 35
    WHEN price >= 50000 THEN 32
    WHEN price >= 30000 THEN 30
    WHEN price >= 20000 THEN 28
    WHEN price >= 10000 THEN 25
    WHEN price >= 5000 THEN 22
    ELSE 20
  END
WHERE original_price IS NULL;

-- Recalculate price as discounted price from original_price
UPDATE public.products SET 
  price = ROUND(original_price * (1 - discount_percentage::NUMERIC / 100), 2)
WHERE original_price IS NOT NULL AND discount_percentage > 0;

-- 2. Create bank_accounts table for admin-editable bank details
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_key TEXT NOT NULL UNIQUE, -- 'account_a' or 'account_b'
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  iban TEXT NOT NULL,
  bic TEXT NOT NULL,
  holder TEXT NOT NULL DEFAULT 'EQUIPTRADE SAS',
  threshold_min NUMERIC(12, 2) DEFAULT 0,
  threshold_max NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default bank accounts
INSERT INTO public.bank_accounts (account_key, name, bank_name, iban, bic, holder, threshold_min, threshold_max)
VALUES 
  ('account_a', 'Compte principal', 'Banque Agricole', 'FR76 1234 5678 9012 3456 7890 123', 'AGRIFRPP', 'EQUIPTRADE SAS', 0, 4999.99),
  ('account_b', 'Compte grands montants', 'Banque Internationale', 'FR76 9876 5432 1098 7654 3210 987', 'BNPAFRPP', 'EQUIPTRADE SAS', 5000, NULL)
ON CONFLICT (account_key) DO NOTHING;

-- Enable RLS on bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for bank_accounts
CREATE POLICY "Anyone can view active bank accounts" 
ON public.bank_accounts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage bank accounts" 
ON public.bank_accounts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Create profiles table for customer management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'FR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_location TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert sample testimonials
INSERT INTO public.testimonials (author_name, author_location, author_company, content, rating, is_featured)
VALUES 
  ('Pierre Martin', 'Bordeaux, France', 'Vignobles Martin', 'Excellent service ! J''ai reçu mon tracteur en parfait état, livré en seulement 5 jours. L''équipe est très professionnelle et réactive. Je recommande vivement.', 5, true),
  ('Hans Mueller', 'Munich, Allemagne', 'Mueller Agrar GmbH', 'Très satisfait de ma moissonneuse-batteuse. Le processus d''achat était simple et la livraison en Allemagne s''est faite sans problème. Super qualité !', 5, true),
  ('Maria Garcia', 'Madrid, Espagne', 'Finca La Esperanza', 'Service client exceptionnel. Ils ont répondu à toutes mes questions et m''ont aidée à choisir le bon équipement pour mon exploitation.', 5, true),
  ('Jean-Luc Dupont', 'Lyon, France', 'EARL Dupont', 'Deuxième achat chez EquipTrade. Toujours la même qualité de service. Les prix sont compétitifs et le matériel est conforme à la description.', 4, true),
  ('Giovanni Rossi', 'Milan, Italie', 'Azienda Agricola Rossi', 'Livraison rapide en Italie, équipement en excellent état. Je suis très content de mon achat et je reviendrai certainement.', 5, false),
  ('Sophie Lefevre', 'Toulouse, France', 'Ferme Bio Lefevre', 'Les cadeaux offerts avec ma commande étaient une belle surprise ! Le tracteur fonctionne parfaitement. Merci à toute l''équipe.', 5, false)
ON CONFLICT DO NOTHING;

-- 5. Create trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Add trigger for updated_at on new tables
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();