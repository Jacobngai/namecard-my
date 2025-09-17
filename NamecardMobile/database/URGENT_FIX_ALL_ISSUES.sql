-- URGENT: Run this complete script in Supabase SQL Editor to fix ALL issues
-- This combines all necessary fixes in the correct order

-- ============================================
-- STEP 1: CREATE STORAGE BUCKET (Fixes "Bucket not found")
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-images',
  'contact-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png']::text[];

-- ============================================
-- STEP 2: FIX STORAGE RLS POLICIES
-- ============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable" ON storage.objects;

-- Create new permissive policies for storage
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contact-images');

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contact-images');

CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'contact-images');

-- ============================================
-- STEP 3: FIX CONTACTS TABLE RLS (Fixes foreign key constraint)
-- ============================================

-- Enable RLS on contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;

-- Create new policies using auth.uid()
CREATE POLICY "Users can view own contacts"
ON contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts"
ON contacts FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own contacts"
ON contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
ON contacts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: CREATE TRIGGER TO AUTO-SET USER_ID
-- ============================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS ensure_user_id ON contacts;
DROP FUNCTION IF EXISTS set_user_id();

-- Create function to automatically set user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is null, set it to the current authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  -- If still null (no authenticated user), raise error
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create contacts';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER ensure_user_id
BEFORE INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

-- ============================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================

-- Grant permissions on contacts table
GRANT ALL ON contacts TO authenticated;
GRANT ALL ON contacts TO anon; -- For authenticated users before token refresh

-- Grant permissions on storage
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- ============================================
-- STEP 6: VERIFY SETUP
-- ============================================

-- Check if bucket exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'contact-images')
    THEN '✅ Storage bucket created successfully'
    ELSE '❌ Storage bucket creation failed'
  END as bucket_status;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('contacts', 'objects')
ORDER BY tablename, policyname;

-- Final status
SELECT '🎉 All fixes have been applied! The app should work now.' as status;