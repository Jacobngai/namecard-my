#!/usr/bin/env ts-node
/**
 * Script to automatically apply database fixes to Supabase
 * Reads URGENT_FIX_ALL_ISSUES.sql and executes it via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = 'https://wvahortlayplumgrcmvi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczMDE2MiwiZXhwIjoyMDczMzA2MTYyfQ.DMSINfrwN53HaOg6ht1HwB6Lg54gyTQ92yTD65-8gDk';

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDatabaseFixes() {
  console.log('🔧 Starting database fixes...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'URGENT_FIX_ALL_ISSUES.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL file loaded successfully');
    console.log('📊 SQL content length:', sqlContent.length, 'characters\n');

    // Split SQL into individual statements
    // Note: This is a simplified split - Supabase's RPC might handle the full script
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('📝 Found', statements.length, 'SQL statements to execute\n');

    // Execute the full SQL via Supabase SQL query
    // Note: Using raw SQL execution requires using the PostgREST admin API
    console.log('⚠️  Note: Direct SQL execution requires Supabase SQL Editor or PostgREST API');
    console.log('📋 Please run the SQL file manually in Supabase Dashboard:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/sql/new');
    console.log('   2. Copy contents from: NamecardMobile/database/URGENT_FIX_ALL_ISSUES.sql');
    console.log('   3. Click "Run"\n');

    // Alternative: Show key fixes that can be done via Supabase client
    console.log('🔍 Checking current database state...\n');

    // Check if contacts table exists
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    if (contactsError) {
      console.log('❌ Contacts table check failed:', contactsError.message);
    } else {
      console.log('✅ Contacts table exists');
    }

    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.log('❌ Storage buckets check failed:', bucketsError.message);
    } else {
      const contactImagesBucket = buckets.find(b => b.name === 'contact-images');
      if (contactImagesBucket) {
        console.log('✅ Storage bucket "contact-images" exists');
      } else {
        console.log('⚠️  Storage bucket "contact-images" not found');
        console.log('   Creating bucket...');

        // Create bucket via Supabase client
        const { data: newBucket, error: createError } = await supabase
          .storage
          .createBucket('contact-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
          });

        if (createError) {
          console.log('❌ Failed to create bucket:', createError.message);
        } else {
          console.log('✅ Storage bucket created successfully!');
        }
      }
    }

    console.log('\n🎯 Summary:');
    console.log('   For complete fix, please run the SQL file in Supabase Dashboard');
    console.log('   This will fix:');
    console.log('   - Storage bucket and RLS policies');
    console.log('   - Contacts table RLS policies');
    console.log('   - Auto-set user_id trigger');
    console.log('   - Permission grants\n');

  } catch (error) {
    console.error('❌ Error running fixes:', error);
    process.exit(1);
  }
}

// Run the fixes
runDatabaseFixes().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
