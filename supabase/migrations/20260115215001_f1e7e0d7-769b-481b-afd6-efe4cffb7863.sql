-- Add customer_images column to products table
ALTER TABLE public.products 
ADD COLUMN customer_images text[] DEFAULT '{}'::text[];