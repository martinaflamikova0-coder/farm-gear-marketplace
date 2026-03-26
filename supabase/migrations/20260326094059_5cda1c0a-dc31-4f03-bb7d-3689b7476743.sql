CREATE POLICY "Anon can view active products via view"
ON public.products
FOR SELECT
TO anon
USING (status = 'active');