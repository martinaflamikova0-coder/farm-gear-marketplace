-- Create a security definer function to check if user is admin
-- (already exists, but ensuring it's available)

-- Create a public view for products that excludes sensitive seller data
CREATE OR REPLACE VIEW public.products_public AS 
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
  created_by
  -- Excludes: seller_name, seller_email, seller_phone
FROM products 
WHERE status = 'active';

-- Grant access to the view
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Update the existing RLS policy on products to be more restrictive for anonymous users
-- First drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Create a new policy that only allows public access to view non-sensitive columns via the view
-- But for direct table access, require authentication or admin role
CREATE POLICY "Authenticated users can view active products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (status = 'active');

-- Admins can still see all products via their existing ALL policy

-- Add a comment to document the security change
COMMENT ON VIEW public.products_public IS 'Public view of products excluding sensitive seller contact information (seller_email, seller_phone). Use this view for public-facing queries.';