-- 1. Bank accounts: remove broad authenticated SELECT, keep admin-only
DROP POLICY IF EXISTS "Authenticated users can view active bank accounts" ON public.bank_accounts;

-- 2. Products: remove anon direct access to base table (force use of products_public view)
DROP POLICY IF EXISTS "Anyone can view active products via public view" ON public.products;

-- 3. Create secure RPC for bank account lookup during checkout
CREATE OR REPLACE FUNCTION public.get_bank_account_for_amount(order_amount numeric)
RETURNS TABLE(
  id uuid,
  account_key text,
  name text,
  bank_name text,
  iban text,
  bic text,
  holder text,
  threshold_min numeric,
  threshold_max numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ba.id, ba.account_key, ba.name, ba.bank_name, ba.iban, ba.bic, ba.holder, ba.threshold_min, ba.threshold_max
  FROM public.bank_accounts ba
  WHERE ba.is_active = true
    AND order_amount >= COALESCE(ba.threshold_min, 0)
    AND (ba.threshold_max IS NULL OR order_amount <= ba.threshold_max)
  ORDER BY ba.threshold_min ASC
  LIMIT 1;
$$;