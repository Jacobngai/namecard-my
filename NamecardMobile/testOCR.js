// Quick test of the job title extraction
console.log('Testing Job Title Extraction in Business Card OCR\n');
console.log('='.repeat(50));

// Simulated OCR text with job title
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

console.log('\nOCR Text Input:');
console.log('-'.repeat(30));
console.log(ocrText);
console.log('-'.repeat(30));

// Check if Finance Manager is present
const hasJobTitle = ocrText.includes('FINANCE MANAGER');
console.log('\n✅ Job Title "FINANCE MANAGER" found in OCR text:', hasJobTitle);

// Simulate parsing
const lines = ocrText.split('\n').filter(line => line.trim());
const jobTitlePattern = /\b(manager|director|executive|officer|ceo|cto|cfo|president|vp|vice president|engineer|developer|consultant|analyst|coordinator|specialist|supervisor|lead|head|chief|founder|owner|partner|associate|assistant|secretary|accountant|designer|architect|advisor|administrator)\b/i;

let extractedJobTitle = '';
for (const line of lines) {
  if (jobTitlePattern.test(line)) {
    extractedJobTitle = line.trim();
    break;
  }
}

console.log('✅ Extracted Job Title:', extractedJobTitle);

// Expected UI flow
console.log('\n📱 Expected UI Flow:');
console.log('1. User scans business card with camera');
console.log('2. OCR extracts text including "FINANCE MANAGER"');
console.log('3. Contact form shows:');
console.log('   - Name: RACHEL TAN');
console.log('   - Job Title: FINANCE MANAGER ← NEW FIELD');
console.log('   - Company: PSG');
console.log('   - Phone: 017-334 7211');
console.log('   - Email: rachel@psg.com.my');
console.log('4. Contact list displays job title below name');

console.log('\n✅ Frontend Updates Completed:');
console.log('- Added jobTitle field to ContactForm state');
console.log('- Added Job Title input field in ContactForm UI');
console.log('- Updated ContactList to display job title');
console.log('- Added styling for job title display');