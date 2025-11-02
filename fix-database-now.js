#!/usr/bin/env node
/**
 * Direct Database Fix Script
 * Executes the SQL fixes using Supabase Management API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_REF = 'wvahortlayplumgrcmvi';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczMDE2MiwiZXhwIjoyMDczMzA2MTYyfQ.DMSINfrwN53HaOg6ht1HwB6Lg54gyTQ92yTD65-8gDk';

console.log('🔧 NAMECARD.MY Database Fix');
console.log('=' .repeat(60));

// Read SQL file
const sqlPath = path.join(__dirname, 'NamecardMobile', 'database', 'URGENT_FIX_ALL_ISSUES.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('📄 Loaded SQL file (' + sql.length + ' characters)');
console.log('\n🔄 Executing SQL via Supabase API...\n');

// Use Supabase SQL API endpoint
const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'apikey': SUPABASE_SERVICE_ROLE_KEY
  }
};

const data = JSON.stringify({
  query: sql
});

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    console.log('📦 Response:', responseData);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ SUCCESS! Database fixes applied!');
      console.log('\n🎉 Your app should now work without foreign key errors!');
    } else {
      console.log('\n❌ API returned error. Trying alternative approach...');
      console.log('\n📋 Please run the SQL manually:');
      console.log('   https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n📋 Fallback: Run SQL manually at:');
  console.log('   https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new');
});

req.write(data);
req.end();
