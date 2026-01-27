-- Check and fix storage policies for payment-receipts bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment receipts" ON storage.objects;

-- Allow authenticated users to upload payment receipts to their own folder
CREATE POLICY "Users can upload their own payment receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own payment receipts
CREATE POLICY "Users can view their own payment receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own payment receipts
CREATE POLICY "Users can update their own payment receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
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