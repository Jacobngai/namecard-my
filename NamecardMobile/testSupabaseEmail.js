const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSignup() {
  console.log('\n🔍 Testing Supabase Email Configuration...\n');
  console.log('Supabase URL:', supabaseUrl);

  // Generate a unique test email
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log(`\n📧 Attempting to sign up with email: ${testEmail}`);

  try {
    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${supabaseUrl}/auth/v1/verify`,
        data: {
          name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('\n❌ Signup error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);

      // Check specific error types
      if (error.message.includes('not authorized')) {
        console.log('\n⚠️  This email domain is not authorized.');
        console.log('Solution: Add this email to your Supabase project team or configure custom SMTP.');
      } else if (error.message.includes('rate limit')) {
        console.log('\n⚠️  Rate limit exceeded.');
        console.log('Solution: Wait a bit or configure custom SMTP for production.');
      }
    } else if (data) {
      console.log('\n✅ Signup request successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Confirmation sent at:', data.user?.confirmation_sent_at);
      console.log('Confirmed:', data.user?.confirmed_at ? 'Yes' : 'No');

      if (data.session) {
        console.log('\n🎉 User logged in immediately (email confirmation disabled)');
      } else {
        console.log('\n📬 Check email for confirmation link');
        console.log('Note: If using default SMTP, only team member emails will receive messages.');
      }
    }

    // Check auth settings
    console.log('\n🔧 Checking auth configuration...');
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Current session:', sessionData.session ? 'Active' : 'None');

  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
  }

  console.log('\n📝 Troubleshooting tips:');
  console.log('1. Check Supabase Dashboard → Authentication → Settings');
  console.log('2. Verify "Enable email confirmations" setting');
  console.log('3. Check Authentication → Logs for email sending attempts');
  console.log('4. For production: Configure custom SMTP (Resend, SendGrid, etc.)');
  console.log('5. For testing: Add your email to Organization → Team members');
}

// Run the test
testEmailSignup();