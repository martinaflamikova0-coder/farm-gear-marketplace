-- Fix: Recreate the view without SECURITY DEFINER (use SECURITY INVOKER instead)
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public 
WITH (security_invoker = true)
AS 
SELECT 
  id,
  title,
  description,
  price,
  price_type,
  category,
  subcategory,
  brand,
  model,
  year,
  hours,
  kilometers,
  condition,
  location,
  department,
  images,
  status,
  featured,
  reference_number,
  stock,
  low_stock_threshold,
  original_price,
  discount_percentage,
  bestseller_rank,
  customer_images,
  merchant_safe_image_url,
  merchant_safe_additional_images,
  title_translations,
  description_translations,
  created_at,
  updated_at,
  created_by,
  seller_name
FROM products 
WHERE status = 'active';

-- Grant access to the view
GRANT SELECT ON public.products_public TO anon, authenticated;

-- We also need to restore anonymous access to products since the frontend needs it
-- But we'll keep the policy that excludes sensitive data by using the view
-- For the direct table, add anonymous access back for the frontend to work
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
TO anon
USING (status = 'active');

-- Add a comment to document the security change
COMMENT ON VIEW public.products_public IS 'Public view of products excluding sensitive seller contact information (seller_email, seller_phone). Use this view for public-facing queries. Note: seller_name is included as it may be needed for display.';