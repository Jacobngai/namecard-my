const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('\n🔍 Testing Supabase Auth Configuration...\n');
  console.log('Supabase URL:', supabaseUrl);

  const testEmail = 'ngsanzen@gmail.com';
  const testPassword = 'Test123456!'; // You'll need to use your actual password

  // Test 1: Try to sign in with the existing account
  console.log('\n📧 Test 1: Attempting to sign in with:', testEmail);
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
      console.log('   Error code:', signInError.code);
      console.log('   Error status:', signInError.status);

      // Check for specific error types
      if (signInError.message.includes('not confirmed') ||
          signInError.message.includes('email_not_confirmed')) {
        console.log('✅ Good! Email verification is required.');
      }
    } else if (signInData?.user) {
      console.log('⚠️  WARNING: User signed in successfully without email verification!');
      console.log('   User ID:', signInData.user.id);
      console.log('   Email:', signInData.user.email);
      console.log('   Email confirmed:', signInData.user.email_confirmed_at ? 'YES' : 'NO');
      console.log('   Confirmed at:', signInData.user.email_confirmed_at);
      console.log('   Created at:', signInData.user.created_at);

      if (signInData.session) {
        console.log('   Session active:', 'YES');
        console.log('   Access token present:', !!signInData.session.access_token);
      }

      // Sign out for next test
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
  }

  // Test 2: Try to sign up with the same email (should fail if already exists)
  console.log('\n📧 Test 2: Attempting to sign up again with:', testEmail);
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.log('✅ Good! Sign up failed as expected:', signUpError.message);
      console.log('   Error code:', signUpError.code);
    } else if (signUpData?.user) {
      console.log('⚠️  WARNING: Sign up succeeded (should have failed for existing user)');
      console.log('   User ID:', signUpData.user.id);
      console.log('   Email confirmed:', signUpData.user.email_confirmed_at ? 'YES' : 'NO');
      console.log('   Identities:', signUpData.user.identities?.length || 0);

      // Check if this is actually a new user or existing
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        console.log('   ⚠️  This appears to be an existing unconfirmed user');
      }
    }
  } catch (err) {
    console.error('Unexpected error during sign up:', err);
  }

  // Test 3: Check current session
  console.log('\n📧 Test 3: Checking current session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (session) {
    console.log('⚠️  Active session found:');
    console.log('   User email:', session.user.email);
    console.log('   Email confirmed:', session.user.email_confirmed_at ? 'YES' : 'NO');
  } else {
    console.log('✅ No active session (expected)');
  }

  // Test 4: Try resend verification
  console.log('\n📧 Test 4: Testing resend verification email...');
  try {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
    });

    if (resendError) {
      console.log('❌ Resend error:', resendError.message);
      console.log('   This might mean the email is already confirmed');
    } else {
      console.log('✅ Resend request successful');
    }
  } catch (err) {
    console.error('Unexpected error during resend:', err);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📝 DIAGNOSIS:');
  console.log('='.repeat(60));
  console.log('\nBased on the tests, here are the possible issues:\n');
  console.log('1. Email confirmations might be DISABLED in Supabase Dashboard');
  console.log('   → Go to Authentication → Providers → Email → "Confirm email" toggle\n');
  console.log('2. The account might already be verified');
  console.log('   → Check the "email_confirmed_at" field in the test results\n');
  console.log('3. Supabase might be in "autoconfirm" mode for development');
  console.log('   → This auto-confirms emails immediately\n');
  console.log('To fix: Go to Supabase Dashboard → Authentication → Providers → Email');
  console.log('and make sure "Confirm email" is ENABLED');
}

// Run the test
console.log('NOTE: You need to update the testPassword variable with your actual password');
console.log('Edit line 19 in this file first, then run again\n');
testAuthFlow();