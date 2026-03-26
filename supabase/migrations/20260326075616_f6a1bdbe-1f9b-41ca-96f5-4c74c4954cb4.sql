CREATE POLICY "Anyone can view active products via public view"
ON public.products
FOR SELECT
TO anon
USING (status = 'active');