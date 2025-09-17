const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConfig() {
  console.log('\n🔍 Checking Supabase Configuration...\n');
  console.log('Project URL:', supabaseUrl);
  console.log('Project ID:', supabaseUrl.split('.')[0].replace('https://', ''));

  // Test with a completely new test email
  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log('\n📧 Testing with fresh test account:', testEmail);

  // Try to sign up
  console.log('\n1️⃣ Attempting signup...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        name: 'Test User'
      }
    }
  });

  if (signUpError) {
    console.log('❌ Signup error:', signUpError.message);
    console.log('   Error details:', JSON.stringify(signUpError, null, 2));
  } else if (signUpData) {
    console.log('✅ Signup response received');

    if (signUpData.user) {
      console.log('\n📊 User object analysis:');
      console.log('   User ID:', signUpData.user.id);
      console.log('   Email:', signUpData.user.email);
      console.log('   Email confirmed at:', signUpData.user.email_confirmed_at);
      console.log('   Confirmation sent at:', signUpData.user.confirmation_sent_at);
      console.log('   Created at:', signUpData.user.created_at);
      console.log('   User metadata:', JSON.stringify(signUpData.user.user_metadata, null, 2));
    }

    if (signUpData.session) {
      console.log('\n⚠️  WARNING: Session created immediately!');
      console.log('   This means email confirmation is DISABLED');
      console.log('   Session token present:', !!signUpData.session.access_token);
    } else {
      console.log('\n✅ Good: No session created (email confirmation required)');
    }
  }

  // Now try to sign in with the unconfirmed account
  console.log('\n2️⃣ Attempting signin with unconfirmed account...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log('✅ Good: Sign in blocked:', signInError.message);
    if (signInError.message.includes('not confirmed')) {
      console.log('   Email confirmation is properly enforced!');
    }
  } else if (signInData?.session) {
    console.log('⚠️  WARNING: Sign in succeeded without email confirmation!');
    console.log('   Email confirmations are DISABLED in Supabase');
  }

  // Check your specific account
  console.log('\n3️⃣ Checking your account (ngsanzen@gmail.com)...');
  const { data: checkData, error: checkError } = await supabase.auth.signInWithPassword({
    email: 'ngsanzen@gmail.com',
    password: 'wrong_password_intentionally', // Using wrong password to just check the error
  });

  if (checkError) {
    console.log('Error message:', checkError.message);
    if (checkError.message.includes('Invalid login')) {
      console.log('   → Account exists and is active');
    } else if (checkError.message.includes('not confirmed')) {
      console.log('   → Account exists but email not confirmed');
    } else if (checkError.message.includes('not registered')) {
      console.log('   → Account does not exist');
    }
  }

  // Diagnosis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  console.log('\nBased on the tests:');

  if (signUpData?.session) {
    console.log('\n❌ PROBLEM FOUND: Email confirmations are DISABLED');
    console.log('\n📝 TO FIX:');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].replace('https://', ''));
    console.log('2. Navigate to: Authentication → Providers → Email');
    console.log('3. Enable: "Confirm email" toggle');
    console.log('4. Save changes');
  } else {
    console.log('\n✅ Email confirmations appear to be enabled');
    console.log('But there might be other issues with the specific account');
  }

  console.log('\n📝 ADDITIONAL CHECKS:');
  console.log('1. Check if your account is already verified in Supabase Dashboard');
  console.log('2. Go to: Authentication → Users');
  console.log('3. Find ngsanzen@gmail.com and check the "Email Confirmed" column');
  console.log('4. If it shows a timestamp, the email is already verified');
}

// Run the check
checkSupabaseConfig();