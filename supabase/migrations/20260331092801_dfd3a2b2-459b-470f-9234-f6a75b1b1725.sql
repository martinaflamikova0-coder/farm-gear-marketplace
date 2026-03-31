
-- Fix seller data exposure: recreate products_public view without security_invoker
-- so it bypasses RLS and only exposes safe columns.
-- Then remove non-admin SELECT policies on base products table.

-- Drop and recreate the view without security_invoker (default=false, runs as owner)
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public AS
  SELECT id,
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
   WHERE (status = 'active'::text);

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Drop non-admin SELECT policies on base products table
-- These expose seller_email and seller_phone to non-admin users
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
DROP POLICY IF EXISTS "Anon can view active products via view" ON public.products;
