# NAMECARD.MY - DATABASE SCHEMA
*Following KISS, YAGNI, DRY principles*

## 🎯 CORE PRINCIPLES APPLIED:
- **KISS (Keep It Simple)**: Minimal tables, clear relationships
- **YAGNI (You Aren't Gonna Need It)**: Only essential fields for MVP
- **DRY (Don't Repeat Yourself)**: No duplicate data, normalized structure

---

## 📊 DATABASE TABLES (Supabase PostgreSQL)

### 1. **users** (Authentication + Profile)
```sql
users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile
  full_name       TEXT,
  whatsapp_intro  TEXT DEFAULT 'Hi! Nice meeting you. Let''s stay connected!',
  
  -- Subscription  
  tier            TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  subscription_end TIMESTAMP WITH TIME ZONE,
  
  -- Distributor Attribution
  referred_by     UUID REFERENCES distributors(id),
  discount_used   TEXT
)
```

### 2. **contacts** (Business Cards)
```sql
contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Info
  name            TEXT NOT NULL,
  company         TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  
  -- Card Image
  card_image_url  TEXT NOT NULL,  -- Original business card photo
  
  -- Networking
  last_contact    TIMESTAMP WITH TIME ZONE,
  
  -- Pro Features (subscription required)
  reminder_date   TIMESTAMP WITH TIME ZONE,
  reminder_note   TEXT,
  voice_notes     JSONB DEFAULT '[]',  -- [{url, transcription, duration, created_at}]
  tags           TEXT[],              -- Array of tags [Friend, Business, etc]
  
  -- Search & Export
  search_text     TEXT GENERATED ALWAYS AS (
    LOWER(COALESCE(name, '') || ' ' || 
          COALESCE(company, '') || ' ' || 
          COALESCE(phone, '') || ' ' || 
          COALESCE(email, ''))
  ) STORED  -- For fast text search
)
```

### 3. **distributors** (Partner Network)
```sql
distributors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Distributor Info
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  country         TEXT NOT NULL,
  code            TEXT UNIQUE NOT NULL, -- DIST-MY-001
  
  -- Status
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  
  -- Banking (for withdrawals)
  bank_details    JSONB,
  
  -- Performance
  total_earnings  DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0
)
```

### 4. **transactions** (All Financial Records)
```sql
transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Transaction Details
  type            TEXT NOT NULL CHECK (type IN ('subscription', 'commission', 'withdrawal')),
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'MYR',
  
  -- References
  user_id         UUID REFERENCES users(id),           -- For subscriptions
  distributor_id  UUID REFERENCES distributors(id),    -- For commissions/withdrawals
  
  -- Metadata
  metadata        JSONB DEFAULT '{}'  -- Flexible for different transaction types
)
```

### 5. **pricing** (Dynamic Pricing Control)
```sql
pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier            TEXT NOT NULL CHECK (tier IN ('pro', 'enterprise')),
  region          TEXT DEFAULT 'global',
  
  -- Pricing
  market_price    DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  commission      DECIMAL(10,2) NOT NULL,
  
  -- Status
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

---

## 🔗 RELATIONSHIPS DIAGRAM

```
users ────┐
          ├── contacts (1:many)
          └── transactions (1:many)

distributors ──── transactions (1:many)

pricing (standalone configuration)
```

---

## 📱 SCANNING APP SPECIFIC FEATURES

### **Core Scanning Workflow:**
```sql
-- 1. User scans business card
INSERT INTO contacts (user_id, name, company, phone, email, card_image_url)
VALUES (user_id, 'John Smith', 'ABC Corp', '+1-555-0123', 'john@abc.com', 'card_123.jpg');

-- 2. User sends WhatsApp intro (auto-update last contact)
UPDATE contacts 
SET last_contact = NOW()
WHERE id = contact_id;

-- 3. Free user exports to Excel
SELECT name, company, phone, email, created_at 
FROM contacts 
WHERE user_id = $1
ORDER BY created_at DESC;
```

### **Pro User Features:**
```sql
-- Set reminder for follow-up
UPDATE contacts 
SET reminder_date = NOW() + INTERVAL '2 weeks',
    reminder_note = 'Follow up about API pricing'
WHERE id = contact_id;

-- Add voice note with AI transcription
UPDATE contacts 
SET voice_notes = voice_notes || 
    '[{"url": "voice_123.wav", "transcription": "Met at conference, discuss enterprise pricing", "duration": 45, "created_at": "2024-03-20T10:30:00Z"}]'::jsonb
WHERE id = contact_id;

-- Search contacts (uses generated search_text field)
SELECT * FROM contacts 
WHERE user_id = $1 
  AND search_text LIKE '%john%'
ORDER BY created_at DESC;
```

### **Offline Support:**
```sql
-- Contacts can be created offline, synced later
-- card_image_url can be local file path initially
INSERT INTO contacts (user_id, name, card_image_url)
VALUES (user_id, 'John Smith', 'file://local_card_123.jpg');

-- Later sync updates with cloud URL and extracted info
UPDATE contacts 
SET card_image_url = 'https://storage.supabase.co/card_123.jpg',
    company = 'ABC Corp',
    phone = '+1-555-0123'
WHERE id = contact_id;
```

### **Essential Indexes for Scanning App:**
```sql
-- Fast contact list for user
CREATE INDEX idx_contacts_user_created ON contacts(user_id, created_at DESC);

-- Search functionality
CREATE INDEX idx_contacts_search ON contacts USING GIN(search_text gin_trgm_ops);

-- Reminder dashboard (Pro users)
CREATE INDEX idx_contacts_reminders ON contacts(user_id, reminder_date) 
WHERE reminder_date IS NOT NULL;

-- Last contact tracking
CREATE INDEX idx_contacts_last_contact ON contacts(user_id, last_contact);
```

---

## 📝 HOW IT FOLLOWS PRINCIPLES:

### ✅ **KISS (Keep It Simple)**:
- **5 tables only** (not 7+ as initially planned)
- **Clear, predictable naming** (users, contacts, distributors, transactions, pricing)
- **Simple relationships** (mostly 1:many, minimal joins)
- **JSONB for flexibility** without complex normalization

### ✅ **YAGNI (You Aren't Gonna Need It)**:
- **No premature optimization** (e.g., no separate commission_rates table)
- **No complex audit trails** (just updated_at timestamps)
- **No user roles table** (simple tier field in users)
- **No separate voice_notes table** (JSONB array in contacts)

### ✅ **DRY (Don't Repeat Yourself)**:
- **Single transactions table** handles subscriptions, commissions, withdrawals
- **JSONB metadata** eliminates need for separate transaction type tables
- **Pricing table** eliminates hardcoded prices in application
- **User tier** eliminates separate subscriptions table

---

## 💾 SAMPLE DATA INSERTION

### Insert Pricing Configuration:
```sql
INSERT INTO pricing (tier, market_price, discounted_price, commission) VALUES
('pro', 199.00, 99.00, 40.00),
('enterprise', 599.00, 299.00, 100.00);
```

### Insert Distributor:
```sql
INSERT INTO distributors (name, email, country, code) VALUES
('John Smith', 'john@example.com', 'Malaysia', 'DIST-MY-001');
```

### User Signs Up with Distributor Code:
```sql
INSERT INTO users (email, full_name, referred_by, discount_used) VALUES
('customer@example.com', 'Jane Customer', 
 (SELECT id FROM distributors WHERE code = 'DIST-MY-001'),
 'DIST-MY-001'
);
```

### Record Subscription Purchase:
```sql
INSERT INTO transactions (type, amount, user_id, distributor_id, metadata) VALUES
('subscription', 99.00, 
 (SELECT id FROM users WHERE email = 'customer@example.com'),
 (SELECT id FROM distributors WHERE code = 'DIST-MY-001'),
 '{"tier": "pro", "duration": "yearly", "original_price": 199.00}'
);

-- Automatically add commission
INSERT INTO transactions (type, amount, distributor_id, metadata) VALUES
('commission', 40.00,
 (SELECT id FROM distributors WHERE code = 'DIST-MY-001'),
 '{"source": "subscription", "tier": "pro"}'
);
```

---

## 🚀 SCALABILITY FEATURES

### Indexes for Performance:
```sql
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_contacts_user_reminder ON contacts(user_id, reminder_date);
CREATE INDEX idx_distributors_code ON distributors(code);
CREATE INDEX idx_transactions_type_distributor ON transactions(type, distributor_id);
```

### Row Level Security (RLS):
```sql
-- Users can only see their own contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_policy ON contacts FOR ALL USING (user_id = auth.uid());

-- Distributors can only see their own transactions  
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY distributor_transactions ON transactions FOR ALL USING (distributor_id = auth.uid());
```

This schema is **simple**, **minimal**, and **flexible** - perfect for rapid MVP development while supporting future growth!