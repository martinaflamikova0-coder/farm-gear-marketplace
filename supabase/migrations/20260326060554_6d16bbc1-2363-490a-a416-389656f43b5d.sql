
-- 1. Fix bank_accounts: restrict public SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active bank accounts" ON public.bank_accounts;
CREATE POLICY "Authenticated users can view active bank accounts"
  ON public.bank_accounts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. Fix products: remove anon access to base products table (seller_email/phone exposure)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Ensure products_public view is accessible to anon (it already masks sensitive columns)
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;
