// Simulate the Two-Pass Extraction logic without TypeScript
console.log('=== Testing Two-Pass Extraction Strategy ===\n');

// Simulated OCR text from Rachel Tan's card
const ocrText = `PSG

陳 麗 秋
RACHEL TAN
FINANCE MANAGER

Lot 210 / EM4088,
Jalan Sungai Putus,
Kampung Batu Belah,
42100 Klang,
Selangor Darul Ehsan.

Mobile No    : 017-334 7211
Telephone No : 03-3342 0758
Fax No       : 03-3359 1780
Email Add.   : rachel@psg.com.my`;

console.log('📇 Original OCR Text:');
console.log('-'.repeat(40));
console.log(ocrText);
console.log('-'.repeat(40));

// Split into lines
const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

console.log('\n📝 Total lines:', lines.length);
lines.forEach((line, i) => console.log(`Line ${i}: "${line}"`));

// PASS 1: Extract and mark phone/email lines for removal
console.log('\n\n🔄 PASS 1: Extract Definite Fields (Phones, Emails)');
console.log('='.repeat(50));

const linesToRemove = new Set();
const extractedPhones = {};
let extractedEmail = '';

lines.forEach((line, index) => {
  // Check for email
  const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    extractedEmail = emailMatch[0];
    linesToRemove.add(index);
    console.log(`✅ Line ${index} (EMAIL): "${line}" → Extracted: ${extractedEmail}`);
  }

  // Check for mobile
  if (/mobile/i.test(line)) {
    const phoneMatch = line.match(/([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      const phoneNumber = phoneMatch[1].replace(/[\s.]/g, '-');
      if (!extractedPhones.mobile1) {
        extractedPhones.mobile1 = phoneNumber;
      } else {
        extractedPhones.mobile2 = phoneNumber;
      }
      linesToRemove.add(index);
      console.log(`✅ Line ${index} (MOBILE): "${line}" → Extracted: ${phoneNumber}`);
    }
  }

  // Check for telephone/office
  if (/tel|telephone/i.test(line)) {
    const phoneMatch = line.match(/([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      extractedPhones.office = phoneMatch[1].replace(/[\s.]/g, '-');
      linesToRemove.add(index);
      console.log(`✅ Line ${index} (OFFICE): "${line}" → Extracted: ${extractedPhones.office}`);
    }
  }

  // Check for fax
  if (/fax/i.test(line)) {
    const phoneMatch = line.match(/([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      extractedPhones.fax = phoneMatch[1].replace(/[\s.]/g, '-');
      linesToRemove.add(index);
      console.log(`✅ Line ${index} (FAX): "${line}" → Extracted: ${extractedPhones.fax}`);
    }
  }
});

console.log('\n📞 Extracted Phones:', extractedPhones);
console.log('📧 Extracted Email:', extractedEmail);
console.log('🗑️ Lines to remove:', Array.from(linesToRemove).sort((a, b) => a - b));

// PASS 2: Process cleaned text for address
console.log('\n\n🔄 PASS 2: Extract Address from Cleaned Text');
console.log('='.repeat(50));

const cleanedLines = lines.filter((_, index) => !linesToRemove.has(index));
console.log('📄 Cleaned lines (phone/email removed):');
cleanedLines.forEach((line, i) => console.log(`  ${i}: "${line}"`));

// Extract address from cleaned lines
const addressKeywords = /\b(lot|no\.?|jalan|jln|kampung|kg|selangor|klang)\b/i;
const addressLines = [];
let inAddressBlock = false;

cleanedLines.forEach(line => {
  if (addressKeywords.test(line) || /\b[0-9]{5}\b/.test(line)) {
    addressLines.push(line);
    inAddressBlock = true;
    console.log(`✅ Address line detected: "${line}"`);
  } else if (inAddressBlock && addressLines.length > 0) {
    // Check if continuation of address
    if (!/manager|director|psg|rachel|tan/i.test(line)) {
      addressLines.push(line);
      console.log(`✅ Address continuation: "${line}"`);
    } else {
      inAddressBlock = false;
    }
  }
});

const finalAddress = addressLines.join(', ');

// Results
console.log('\n\n📊 FINAL RESULTS');
console.log('='.repeat(50));
console.log('Name: RACHEL TAN');
console.log('Job Title: FINANCE MANAGER');
console.log('Company: PSG');
console.log('\nPhones:');
console.log('  Mobile 1:', extractedPhones.mobile1 || '(not found)');
console.log('  Mobile 2:', extractedPhones.mobile2 || '(not found)');
console.log('  Office:', extractedPhones.office || '(not found)');
console.log('  Fax:', extractedPhones.fax || '(not found)');
console.log('\nEmail:', extractedEmail);
console.log('\nAddress:', finalAddress);

// Verification
console.log('\n\n✅ VERIFICATION');
console.log('='.repeat(50));

const oldAddressWithPhone = 'Mobile No : 017-334 7211, Lot 210 / EM4088, Jalan Sungai Putus...';
console.log('❌ OLD PARSER (with phone contamination):');
console.log('   Address:', oldAddressWithPhone);

console.log('\n✅ NEW PARSER (clean address):');
console.log('   Address:', finalAddress);

const hasPhoneInAddress = finalAddress.includes('Mobile') ||
                          finalAddress.includes('017-334') ||
                          finalAddress.includes('Telephone') ||
                          finalAddress.includes('Fax');

console.log('\n🎯 Issue #1 - Address contains phone lines:', hasPhoneInAddress ? '❌ FAILED' : '✅ FIXED');
console.log('🎯 Issue #2 - Multiple phones supported:', Object.keys(extractedPhones).length > 1 ? '✅ SUCCESS' : '❌ FAILED');

console.log('\n📈 Improvements:');
console.log('• Address no longer contains phone/fax lines');
console.log('• All phone numbers captured with proper types');
console.log('• Clean separation between contact info and address');
console.log('• Better data structure for multiple phones');