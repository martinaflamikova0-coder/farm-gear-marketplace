-- Fix storage policies for payment-receipts bucket
-- The issue is that policies are RESTRICTIVE by default, meaning ALL must pass
-- We need to make them PERMISSIVE so ANY matching policy allows the action

-- First, drop all existing payment-receipts policies
DROP POLICY IF EXISTS "Users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment receipts" ON storage.objects;

-- Recreate policies as PERMISSIVE (default for CREATE POLICY without AS RESTRICTIVE)
-- Allow authenticated users to upload payment receipts to their own folder
CREATE POLICY "Users can upload payment receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own payment receipts
CREATE POLICY "Users can view their own payment receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own payment receipts
CREATE POLICY "Users can update their own payment receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view ALL payment receipts
CREATE POLICY "Admins can view all payment receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);