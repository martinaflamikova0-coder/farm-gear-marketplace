
-- Make user_id nullable for anonymous orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies on orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Allow anyone (including anonymous) to create orders
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing RLS policies on order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Allow anyone to insert order items
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated users can view their own order items (through order)
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Allow anonymous uploads to payment-receipts bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT 'payment-receipts', '.keep', NULL, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'payment-receipts' AND name = '.keep');
