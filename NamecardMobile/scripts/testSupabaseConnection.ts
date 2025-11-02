/**
 * Test Supabase Connection and Authentication
 * Run this script to verify your Supabase setup is working correctly
 *
 * Usage: npx ts-node scripts/testSupabaseConnection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.development
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check if credentials exist
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.development');
  console.log('SUPABASE_URL:', SUPABASE_URL || 'NOT SET');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET');
  process.exit(1);
}

console.log('✅ Credentials found:');
console.log('   URL:', SUPABASE_URL);
console.log('   Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('\n📊 Testing Database Connection...');

  try {
    // Test 1: Check if we can query the database
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.contacts" does not exist')) {
        console.log('⚠️  Contacts table does not exist - Please run the SQL schema');
        return false;
      } else if (error.message.includes('JWT')) {
        console.log('⚠️  Authentication issue - Credentials may be invalid');
        return false;
      } else {
        console.log('❌ Database error:', error.message);
        return false;
      }
    }

    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

async function testStorage() {
  console.log('\n📦 Testing Storage Bucket...');

  try {
    const { data, error } = await supabase
      .storage
      .from('contact-images')
      .list('', { limit: 1 });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        console.log('⚠️  Storage bucket does not exist - Please run the SQL schema');
        return false;
      } else {
        console.log('❌ Storage error:', error.message);
        return false;
      }
    }

    console.log('✅ Storage bucket accessible!');
    return true;
  } catch (err) {
    console.error('❌ Storage test failed:', err);
    return false;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');

  try {
    // Try to get current session (should be null if not logged in)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.log('❌ Auth error:', error.message);
      return false;
    }

    if (session) {
      console.log('✅ Active session found for:', session.user.email);
    } else {
      console.log('ℹ️  No active session (user not logged in)');
    }

    console.log('✅ Authentication system working!');
    return true;
  } catch (err) {
    console.error('❌ Auth test failed:', err);
    return false;
  }
}

async function createTestUser() {
  console.log('\n👤 Creating Test User...');

  const testEmail = `test_${Date.now()}@namecard.my`;
  const testPassword = 'TestPassword123!';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.log('❌ Could not create test user:', error.message);
      return null;
    }

    console.log('✅ Test user created:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('   User ID:', data.user?.id);

    return { email: testEmail, password: testPassword, user: data.user };
  } catch (err) {
    console.error('❌ User creation failed:', err);
    return null;
  }
}

async function testContactOperations(userId: string) {
  console.log('\n📇 Testing Contact Operations...');

  try {
    // Create a test contact
    const testContact = {
      user_id: userId,
      name: 'Test Contact',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      job_title: 'Tester',
      address: '123 Test St',
      website: 'https://test.com',
      notes: 'Created by test script',
    };

    const { data: created, error: createError } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
      .single();

    if (createError) {
      console.log('❌ Could not create contact:', createError.message);
      return false;
    }

    console.log('✅ Contact created:', created.id);

    // Read the contact
    const { data: read, error: readError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', created.id)
      .single();

    if (readError) {
      console.log('❌ Could not read contact:', readError.message);
      return false;
    }

    console.log('✅ Contact read successfully');

    // Delete the test contact
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('❌ Could not delete contact:', deleteError.message);
      return false;
    }

    console.log('✅ Contact deleted successfully');
    console.log('✅ All CRUD operations working!');
    return true;
  } catch (err) {
    console.error('❌ Contact operations failed:', err);
    return false;
  }
}

async function runTests() {
  console.log('=' .repeat(50));
  console.log('🚀 SUPABASE CONNECTION TEST');
  console.log('=' .repeat(50));

  const results = {
    connection: await testConnection(),
    storage: await testStorage(),
    auth: await testAuth(),
    operations: false,
  };

  // If basic tests pass, try creating a test user and testing operations
  if (results.connection && results.auth) {
    const testUser = await createTestUser();
    if (testUser && testUser.user) {
      results.operations = await testContactOperations(testUser.user.id);
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));

  console.log(`Database Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Storage Bucket:      ${results.storage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication:      ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRUD Operations:     ${results.operations ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('Next steps:');
    console.log('1. Start your app: npm run start:clear');
    console.log('2. Sign up with a new account');
    console.log('3. Your contacts will sync automatically!');
  } else {
    console.log('\n⚠️  Some tests failed. Please:');
    if (!results.connection) {
      console.log('1. Run the database schema in Supabase SQL Editor');
    }
    if (!results.storage) {
      console.log('2. Ensure storage bucket is created (run SQL schema)');
    }
    if (!results.auth) {
      console.log('3. Check your Supabase credentials in .env.development');
    }
  }

  console.log('\n' + '=' .repeat(50));
}

// Run the tests
runTests().catch(console.error);