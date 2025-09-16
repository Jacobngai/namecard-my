# Database Setup for NAMECARD.MY

## Quick Setup Instructions

### 1. Set up Supabase Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the contents of `schema.sql` into the editor
4. Click "Run" to execute the SQL

This will create:
- `contacts` table with all required fields
- Row-level security policies for data protection
- Storage bucket for business card images
- Proper indexes for performance
- Sample data (optional)

### 2. Verify Setup

After running the schema, you can verify the setup by:

1. Go to "Table Editor" → Check that `contacts` table exists
2. Go to "Storage" → Check that `contact-images` bucket exists
3. Go to "Authentication" → Policies → Check RLS policies are active

### 3. Test the App

The app should now work without database errors:
- Contact list will load (empty initially)
- Business card scanning will save to database
- Image uploads will work with storage bucket

### 4. Optional: Add Sample Data

If you want some test contacts, uncomment the INSERT statements at the bottom of `schema.sql` before running it.

## Troubleshooting

**Error: "table public.contacts does not exist"**
- Make sure you ran the schema.sql in your Supabase SQL Editor

**Error: "new row violates row-level security policy"**
- This is normal for anonymous users
- The app creates contacts without user_id for the free tier
- RLS policies allow this with `user_id IS NULL` condition

**Storage issues**
- Make sure the `contact-images` bucket was created
- Check that storage policies are enabled