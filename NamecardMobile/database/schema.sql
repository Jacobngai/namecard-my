-- NAMECARD.MY Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY DEFAULT 'contact_' || extract(epoch from now())::bigint::text,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL DEFAULT '',
    company TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    card_image_url TEXT NOT NULL DEFAULT '',
    last_contact TIMESTAMPTZ,
    reminder_date TIMESTAMPTZ,
    reminder_note TEXT,
    voice_notes JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for contact images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contact-images',
    'contact-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contacts (or public contacts if no user_id)
CREATE POLICY "Users can view own contacts" ON public.contacts
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- Policy: Users can insert their own contacts
CREATE POLICY "Users can insert own contacts" ON public.contacts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update own contacts" ON public.contacts
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- Policy: Users can delete their own contacts
CREATE POLICY "Users can delete own contacts" ON public.contacts
    FOR DELETE USING (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- Storage policies for contact images
CREATE POLICY "Users can upload contact images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'contact-images');

CREATE POLICY "Users can view contact images" ON storage.objects
    FOR SELECT USING (bucket_id = 'contact-images');

CREATE POLICY "Users can update contact images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'contact-images');

CREATE POLICY "Users can delete contact images" ON storage.objects
    FOR DELETE USING (bucket_id = 'contact-images');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- Insert some sample data for testing (optional)
-- INSERT INTO public.contacts (name, company, phone, email, address, card_image_url) VALUES 
-- ('John Doe', 'Tech Corp', '+1-555-0123', 'john@techcorp.com', '123 Tech Street, Silicon Valley', ''),
-- ('Jane Smith', 'Design Studio', '+1-555-0124', 'jane@designstudio.com', '456 Creative Ave, New York', ''),
-- ('Bob Johnson', 'Marketing Plus', '+1-555-0125', 'bob@marketingplus.com', '789 Business Blvd, Chicago', '');