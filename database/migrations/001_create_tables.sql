-- NAMECARD.MY Database Schema
-- Following KISS, DRY, YAGNI principles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (leverages Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_distributor BOOLEAN DEFAULT FALSE,
    distributor_code TEXT UNIQUE,
    distributor_commission_rate DECIMAL(3,2) DEFAULT 0.50, -- 50% default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONTACTS TABLE
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    card_image_url TEXT,
    notes TEXT,
    linkedin_url TEXT,
    tags TEXT[], -- Simple array for tags (KISS)
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DISTRIBUTORS TABLE (simplified - references users)
CREATE TABLE distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    total_sales INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,
    bank_account_info JSONB, -- Flexible for different countries (YAGNI)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE (unified for all financial records - DRY)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'commission', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB, -- Flexible storage for payment details, subscription info, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRICING TABLE (dynamic pricing control)
CREATE TABLE pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier TEXT UNIQUE NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    features JSONB NOT NULL, -- Flexible feature list
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_distributor_id ON transactions(distributor_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies (KISS - users can only see their own data)
CREATE POLICY "Users can view own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Distributors can view own data" ON distributors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view pricing" ON pricing FOR SELECT USING (true);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();