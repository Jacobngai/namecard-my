import { EnhancedOCRParser } from './enhancedOCRParser';

// Test with Rachel Tan's business card text
const testRachelTanCard = () => {
  // Simulated OCR output from Google Vision
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

  console.log('=== Testing Enhanced OCR Parser ===');
  console.log('\nOriginal OCR Text:');
  console.log('-------------------');
  console.log(ocrText);
  console.log('-------------------\n');

  const result = EnhancedOCRParser.parseBusinessCard(ocrText);

  console.log('\nExtracted Fields:');
  console.log('----------------');
  console.log(`Name: ${result.name || '(not found)'}`);
  console.log(`Job Title: ${result.jobTitle || '(not found)'}`);
  console.log(`Company: ${result.company || '(not found)'}`);
  console.log(`Phone: ${result.phone || '(not found)'}`);
  console.log(`Email: ${result.email || '(not found)'}`);
  console.log(`Address: ${result.address || '(not found)'}`);

  console.log('\nConfidence Scores:');
  console.log('-----------------');
  console.log(`Overall: ${(result.confidence.overall * 100).toFixed(1)}%`);
  console.log(`Name: ${(result.confidence.name * 100).toFixed(1)}%`);
  console.log(`Job Title: ${(result.confidence.jobTitle * 100).toFixed(1)}%`);
  console.log(`Company: ${(result.confidence.company * 100).toFixed(1)}%`);
  console.log(`Phone: ${(result.confidence.phone * 100).toFixed(1)}%`);
  console.log(`Email: ${(result.confidence.email * 100).toFixed(1)}%`);
  console.log(`Address: ${(result.confidence.address * 100).toFixed(1)}%`);

  // Verify correctness
  console.log('\n✅ Verification:');
  console.log('---------------');
  const isNameCorrect = result.name.toLowerCase().includes('rachel tan');
  const isCompanyCorrect = result.company.toLowerCase().includes('psg');
  const isJobTitleCorrect = result.jobTitle.toLowerCase().includes('finance manager');
  const isPhoneCorrect = result.phone.includes('017-334 7211');
  const isEmailCorrect = result.email === 'rachel@psg.com.my';

  console.log(`✓ Name correctly identified as "Rachel Tan": ${isNameCorrect ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Company correctly identified as "PSG": ${isCompanyCorrect ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Job title correctly identified as "Finance Manager": ${isJobTitleCorrect ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Mobile number correctly extracted: ${isPhoneCorrect ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Email correctly extracted: ${isEmailCorrect ? 'YES ✅' : 'NO ❌'}`);

  return result;
};

// Alternative test with different formatting
const testAlternativeFormat = () => {
  // Test with all caps name (common in business cards)
  const ocrTextAllCaps = `RACHEL TAN
FINANCE MANAGER
PSG SDN BHD

Lot 210/EM4088, Jalan Sungai Putus,
Kampung Batu Belah, 42100 Klang,
Selangor Darul Ehsan

Tel: 03-3342 0758
Mobile: 017-334 7211
Email: rachel@psg.com.my`;

  console.log('\n\n=== Testing Alternative Format (All Caps) ===');
  console.log('\nOCR Text:');
  console.log('---------');
  console.log(ocrTextAllCaps);
  console.log('---------\n');

  const result = EnhancedOCRParser.parseBusinessCard(ocrTextAllCaps);

  console.log('Extracted:');
  console.log(`Name: ${result.name}`);
  console.log(`Title: ${result.jobTitle}`);
  console.log(`Company: ${result.company}`);
  console.log(`Phone: ${result.phone}`);
  console.log(`Email: ${result.email}`);
  console.log(`Overall Confidence: ${(result.confidence.overall * 100).toFixed(1)}%`);

  return result;
};

// Export test function for use in other files
export const runOCRTests = () => {
  const result1 = testRachelTanCard();
  const result2 = testAlternativeFormat();

  return {
    rachelTanTest: result1,
    alternativeFormatTest: result2
  };
};

// Run tests if this file is executed directly
if (require.main === module) {
  runOCRTests();
}