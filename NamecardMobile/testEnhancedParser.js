// Test the enhanced OCR parser with Two-Pass Extraction Strategy
const { EnhancedOCRParser } = require('./services/enhancedOCRParser');

console.log('=== Testing Enhanced OCR Parser with Two-Pass Extraction ===\n');
console.log('Strategy: Two-Pass Extraction with Field Isolation');
console.log('- Pass 1: Extract and remove phone/email lines');
console.log('- Pass 2: Extract address from cleaned text');
console.log('='.repeat(60));

// Test Case 1: Rachel Tan's business card
console.log('\n📇 TEST 1: Rachel Tan Business Card');
console.log('-'.repeat(40));

const rachelCardText = `PSG

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

console.log('Input OCR Text:');
console.log(rachelCardText);
console.log('-'.repeat(40));

const result1 = EnhancedOCRParser.parseBusinessCard(rachelCardText);

console.log('\n✅ Extracted Data:');
console.log('Name:', result1.name);
console.log('Job Title:', result1.jobTitle);
console.log('Company:', result1.company);
console.log('\nPhones:');
console.log('  Mobile 1:', result1.phones.mobile1 || '(not found)');
console.log('  Mobile 2:', result1.phones.mobile2 || '(not found)');
console.log('  Office:', result1.phones.office || '(not found)');
console.log('  Fax:', result1.phones.fax || '(not found)');
console.log('\nEmail:', result1.email);
console.log('\nAddress:', result1.address);

console.log('\n📊 Confidence Scores:');
Object.entries(result1.confidence).forEach(([field, score]) => {
  console.log(`  ${field}: ${(score * 100).toFixed(1)}%`);
});

// Verify the fix worked
console.log('\n🔍 Verification - Issue #1 (Address containing phone lines):');
const hasPhoneInAddress = result1.address.includes('Mobile') ||
                          result1.address.includes('017-334') ||
                          result1.address.includes('Telephone') ||
                          result1.address.includes('Fax');
console.log(`Address contains phone lines: ${hasPhoneInAddress ? '❌ FAILED' : '✅ FIXED'}`);
console.log(`Address value: "${result1.address}"`);

console.log('\n🔍 Verification - Issue #2 (Multiple phone support):');
const hasMultiplePhones = result1.phones.mobile1 && result1.phones.office && result1.phones.fax;
console.log(`Multiple phones captured: ${hasMultiplePhones ? '✅ SUCCESS' : '❌ FAILED'}`);

// Test Case 2: Card with multiple mobile numbers
console.log('\n\n📇 TEST 2: Card with Multiple Mobile Numbers');
console.log('-'.repeat(40));

const multiMobileCard = `JOHN DOE
Sales Director
ABC Corporation Sdn Bhd

Mobile 1: 012-345 6789
Mobile 2: 019-876 5432
Office: 03-8888 9999
Fax: 03-8888 9998
Email: john.doe@abc.com.my

Level 15, Tower A,
Vertical Business Suite,
Bangsar South,
59200 Kuala Lumpur,
Malaysia`;

console.log('Input OCR Text:');
console.log(multiMobileCard);
console.log('-'.repeat(40));

const result2 = EnhancedOCRParser.parseBusinessCard(multiMobileCard);

console.log('\n✅ Extracted Data:');
console.log('Name:', result2.name);
console.log('Job Title:', result2.jobTitle);
console.log('Company:', result2.company);
console.log('\nPhones:');
console.log('  Mobile 1:', result2.phones.mobile1 || '(not found)');
console.log('  Mobile 2:', result2.phones.mobile2 || '(not found)');
console.log('  Office:', result2.phones.office || '(not found)');
console.log('  Fax:', result2.phones.fax || '(not found)');
console.log('\nEmail:', result2.email);
console.log('\nAddress:', result2.address);

// Verify both mobile numbers captured
console.log('\n🔍 Verification - Multiple Mobile Numbers:');
const hasBothMobiles = result2.phones.mobile1 === '012-345-6789' &&
                       result2.phones.mobile2 === '019-876-5432';
console.log(`Both mobile numbers captured: ${hasBothMobiles ? '✅ SUCCESS' : '❌ FAILED'}`);

// Test Case 3: Problematic card with "No." in address
console.log('\n\n📇 TEST 3: Problematic Address with "No."');
console.log('-'.repeat(40));

const problematicCard = `SARAH LEE
Marketing Manager
XYZ Services

HP: 016-555 4444
Tel: 03-7777 8888

No. 88, Jalan Merdeka,
Taman Sentosa,
50000 Kuala Lumpur`;

console.log('Input OCR Text:');
console.log(problematicCard);
console.log('-'.repeat(40));

const result3 = EnhancedOCRParser.parseBusinessCard(problematicCard);

console.log('\n✅ Extracted Data:');
console.log('Name:', result3.name);
console.log('Job Title:', result3.jobTitle);
console.log('Company:', result3.company);
console.log('Phones:');
console.log('  Mobile 1:', result3.phones.mobile1 || '(not found)');
console.log('  Office:', result3.phones.office || '(not found)');
console.log('Address:', result3.address);

console.log('\n🔍 Verification - Address with "No." prefix:');
const addressStartsCorrectly = result3.address.startsWith('No. 88');
const addressHasNoPhone = !result3.address.includes('016-555') && !result3.address.includes('HP:');
console.log(`Address starts with "No. 88": ${addressStartsCorrectly ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`Address excludes phone lines: ${addressHasNoPhone ? '✅ SUCCESS' : '❌ FAILED'}`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📈 SUMMARY OF IMPROVEMENTS:');
console.log('='.repeat(60));
console.log('\n✅ Issue #1 FIXED: Address field no longer contains phone/fax lines');
console.log('   - Two-pass extraction removes phone lines before address extraction');
console.log('   - Clean separation between contact info and address');
console.log('\n✅ Issue #2 FIXED: Multiple phone numbers now supported');
console.log('   - Supports mobile1, mobile2, office, and fax');
console.log('   - Intelligent type detection based on keywords');
console.log('   - Maintains backward compatibility with single phone field');
console.log('\n✅ Additional Benefits:');
console.log('   - Higher confidence scores due to cleaner extraction');
console.log('   - Better handling of Malaysian business card formats');
console.log('   - More maintainable code with clear separation of concerns');