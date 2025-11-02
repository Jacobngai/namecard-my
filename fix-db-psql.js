#!/usr/bin/env node
/**
 * PostgreSQL Direct Connection Fix
 * Uses node-postgres to execute SQL directly
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase PostgreSQL connection details
const connectionString = 'postgresql://postgres.wvahortlayplumgrcmvi:Zaq12wsx@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🔧 NAMECARD.MY Database Fix via PostgreSQL');
console.log('=' .repeat(60));

async function executeFix() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'NamecardMobile', 'database', 'URGENT_FIX_ALL_ISSUES.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('📄 Loaded SQL file (' + sql.length + ' characters)');

    console.log('\n🔄 Executing SQL fixes...\n');

    // Execute the SQL
    const result = await client.query(sql);

    console.log('✅ SQL executed successfully!');
    console.log('📊 Result:', result);

    console.log('\n🎉 Database fixes applied! Your app should work now!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  The connection string might need the database password.');
    console.log('📋 Please run SQL manually at:');
    console.log('   https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/sql/new');
  } finally {
    await client.end();
  }
}

// Check if pg is installed
try {
  require.resolve('pg');
  executeFix();
} catch (e) {
  console.log('⚠️  Installing pg library...');
  const { execSync } = require('child_process');
  execSync('npm install pg', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Installed! Retrying...\n');
  executeFix();
}
