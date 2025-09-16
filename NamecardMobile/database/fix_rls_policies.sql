-- Run this SQL in your Supabase SQL Editor to fix the RLS policies and foreign key issues

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

-- Create improved RLS policies using auth.uid()
CREATE POLICY "Users can view own contacts"
ON contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts"
ON contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
ON contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
ON contacts FOR DELETE
USING (auth.uid() = user_id);

-- Create a function to auto-populate user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is null or empty, set it to the current user's ID
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  -- Verify the user_id matches the authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_id ON contacts;

-- Create the trigger
CREATE TRIGGER ensure_user_id
BEFORE INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON contacts TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;