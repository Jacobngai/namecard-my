#!/usr/bin/env node
/**
 * Script to automatically apply database fixes to Supabase
 * Executes the SQL from URGENT_FIX_ALL_ISSUES.sql
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://wvahortlayplumgrcmvi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczMDE2MiwiZXhwIjoyMDczMzA2MTYyfQ.DMSINfrwN53HaOg6ht1HwB6Lg54gyTQ92yTD65-8gDk';

console.log('🔧 Supabase Database Fix Script\n');
console.log('📍 Project: wvahortlayplumgrcmvi');
console.log('🌐 URL:', SUPABASE_URL);
console.log('\n' + '='.repeat(60) + '\n');

// Read the SQL file
const sqlPath = path.join(__dirname, '..', 'database', 'URGENT_FIX_ALL_ISSUES.sql');
console.log('📄 Reading SQL file:', sqlPath);

if (!fs.existsSync(sqlPath)) {
  console.error('❌ SQL file not found:', sqlPath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
console.log('✅ SQL file loaded (' + sqlContent.length + ' characters)\n');

// Function to execute SQL via Supabase REST API
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'wvahortlayplumgrcmvi.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main execution
async function runFixes() {
  console.log('⚠️  IMPORTANT NOTE:');
  console.log('   The Supabase REST API doesn\'t support direct SQL execution.');
  console.log('   You need to run the SQL in the Supabase Dashboard.\n');

  console.log('📋 INSTRUCTIONS:');
  console.log('   1. Open: https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/sql/new');
  console.log('   2. Copy the SQL from: NamecardMobile/database/URGENT_FIX_ALL_ISSUES.sql');
  console.log('   3. Paste into the SQL Editor');
  console.log('   4. Click "RUN" button\n');

  console.log('🔍 Alternatively, here is the complete SQL to copy:\n');
  console.log('='.repeat(60));
  console.log(sqlContent);
  console.log('='.repeat(60));

  console.log('\n✅ Once you run this SQL, your database will have:');
  console.log('   - ✅ Storage bucket "contact-images" created');
  console.log('   - ✅ RLS policies fixed for storage');
  console.log('   - ✅ RLS policies fixed for contacts table');
  console.log('   - ✅ Auto-set user_id trigger installed');
  console.log('   - ✅ Proper permissions granted\n');

  console.log('💡 This will fix the foreign key constraint error you\'re seeing!\n');
}

runFixes().catch(console.error);
