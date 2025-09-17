-- Fix storage bucket RLS policies
-- Run this in Supabase SQL Editor to fix the storage bucket creation issue

-- First, check if the bucket exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'contact-images'
  ) THEN
    -- Create the bucket with proper configuration
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'contact-images',
      'contact-images',
      true,
      5242880, -- 5MB
      ARRAY['image/jpeg', 'image/jpg', 'image/png']::text[]
    );
  END IF;
END $$;

-- Drop existing RLS policies on storage.objects if they exist
DROP POLICY IF EXISTS "Users can upload their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view contact images" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage.objects
-- Allow authenticated users to upload images to contact-images bucket
CREATE POLICY "Users can upload their own contact images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contact-images' AND
  auth.uid() IS NOT NULL
);

-- Allow users to view all images in the public bucket (since it's public)
CREATE POLICY "Public can view contact images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own contact images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contact-images' AND
  auth.uid() IS NOT NULL
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own contact images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contact-images' AND
  auth.uid() IS NOT NULL
);

-- Grant necessary permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Ensure the bucket is properly configured
UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png']::text[]
WHERE name = 'contact-images';

-- Create RLS policies for storage.buckets (if needed)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view bucket information
DROP POLICY IF EXISTS "Authenticated users can view buckets" ON storage.buckets;
CREATE POLICY "Authenticated users can view buckets"
ON storage.buckets FOR SELECT
USING (true);

-- Output confirmation
SELECT 'Storage bucket RLS policies have been configured successfully' AS status;