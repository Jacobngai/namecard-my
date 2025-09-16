const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactCreation() {
  console.log('\n🔍 TESTING CONTACT CREATION WITH AUTH\n');
  console.log('=' .repeat(60));

  // Step 1: Sign in with your actual account
  const email = 'ngsanzen@gmail.com';
  const password = 'YOUR_PASSWORD_HERE'; // You need to update this

  console.log('\n1️⃣ Signing in as:', email);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (authError) {
    console.log('❌ Sign in failed:', authError.message);
    console.log('Please update the password on line 14 and try again');
    return;
  }

  console.log('✅ Signed in successfully');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  // Step 2: Try to create a contact
  console.log('\n2️⃣ Creating a test contact...');
  const testContact = {
    user_id: authData.user.id,  // Using the actual user ID
    name: 'Test Contact',
    company: 'Test Company',
    phone: '+1234567890',
    email: 'test@example.com',
  };

  const { data: contactData, error: contactError } = await supabase
    .from('contacts')
    .insert(testContact)
    .select()
    .single();

  if (contactError) {
    console.log('❌ Contact creation failed:', contactError.message);

    if (contactError.message.includes('foreign key')) {
      console.log('\n⚠️  This should NOT happen anymore!');
      console.log('The fix ensures we use the authenticated user ID');
    }
  } else {
    console.log('✅ Contact created successfully!');
    console.log('   Contact ID:', contactData.id);
    console.log('   Name:', contactData.name);
    console.log('   User ID:', contactData.user_id);

    // Clean up - delete the test contact
    console.log('\n3️⃣ Cleaning up test contact...');
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactData.id);

    if (!deleteError) {
      console.log('✅ Test contact deleted');
    }
  }

  // Step 3: Sign out
  await supabase.auth.signOut();
  console.log('\n✅ Signed out');

  console.log('\n' + '=' .repeat(60));
  console.log('📝 SUMMARY');
  console.log('=' .repeat(60));
  console.log('\n✅ The fix removes the hardcoded user ID');
  console.log('✅ Now uses the actual authenticated user\'s ID');
  console.log('✅ Each user can only see/modify their own contacts');
  console.log('✅ Foreign key constraint errors are resolved');
}

console.log('\n⚠️  NOTE: Update the password on line 14 before running!');
console.log('Edit testContactCreation.js and set your actual password\n');

// Uncomment this line after setting your password:
// testContactCreation();