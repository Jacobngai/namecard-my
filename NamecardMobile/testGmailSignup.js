const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGmailSignup() {
  console.log('\n🔍 Testing with Gmail domain...\n');

  // Test with a Gmail address
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!';

  console.log('📧 Testing signup with:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { name: 'Test User' }
    }
  });

  if (error) {
    console.log('\n❌ Signup error:', error.message);
    console.log('   Error code:', error.code);

    if (error.message.includes('invalid')) {
      console.log('\n⚠️  ISSUE: Supabase is rejecting this email');
      console.log('Possible reasons:');
      console.log('1. Email domain restrictions are enabled');
      console.log('2. Only team member emails are allowed (default SMTP limitation)');
    }
  } else if (data) {
    console.log('\n✅ Signup successful!');

    if (data.user) {
      console.log('User created:');
      console.log('  ID:', data.user.id);
      console.log('  Email:', data.user.email);
      console.log('  Confirmed:', data.user.email_confirmed_at ? 'YES' : 'NO');
    }

    if (data.session) {
      console.log('\n⚠️  Session created immediately!');
      console.log('→ Email confirmation is DISABLED');
    } else {
      console.log('\n✅ No session (email confirmation required)');
    }
  }

  // Now check the actual issue with ngsanzen@gmail.com
  console.log('\n' + '='.repeat(60));
  console.log('🔍 FINAL DIAGNOSIS');
  console.log('='.repeat(60));

  if (error?.message.includes('invalid')) {
    console.log('\n❌ PROBLEM: Supabase is only accepting authorized emails');
    console.log('\n📝 SOLUTION:');
    console.log('1. Go to Supabase Dashboard → Organization Settings → Team');
    console.log('2. Add ngsanzen@gmail.com as a team member');
    console.log('3. OR configure custom SMTP to remove this restriction');
    console.log('\nThis is why ngsanzen@gmail.com can sign in - it\'s probably already');
    console.log('a team member and therefore already verified!');
  }
}

testGmailSignup();