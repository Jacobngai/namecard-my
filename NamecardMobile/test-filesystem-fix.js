// Test FileSystem Legacy API Fix
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing FileSystem Legacy API Updates');
console.log('=========================================\n');

let allFixed = true;
const filesToCheck = [
  'services/localStorage.ts',
  'services/contactService.ts',
  'services/openai.ts'
];

console.log('Checking FileSystem imports...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for legacy import
    if (content.includes("from 'expo-file-system/legacy'")) {
      console.log(`✅ ${file}: Using legacy API`);
    } else if (content.includes("from 'expo-file-system'")) {
      console.log(`❌ ${file}: Still using deprecated API`);
      allFixed = false;
    } else {
      console.log(`⚠️ ${file}: No FileSystem import found`);
    }
  } else {
    console.log(`❌ ${file}: File not found`);
  }
});

console.log('\n=========================================');
console.log('Result:', allFixed ? '✅ All files updated to legacy API' : '❌ Some files need updating');

// Check localStorage implementation
console.log('\n📁 Checking localStorage implementation...');

const localStoragePath = path.join(__dirname, 'services/localStorage.ts');
if (fs.existsSync(localStoragePath)) {
  const content = fs.readFileSync(localStoragePath, 'utf8');

  // Check for proper initialization
  if (content.includes('getInfoAsync') && content.includes('legacy')) {
    console.log('✅ localStorage uses legacy getInfoAsync');
  }

  if (content.includes('makeDirectoryAsync') && content.includes('legacy')) {
    console.log('✅ localStorage uses legacy makeDirectoryAsync');
  }

  if (content.includes('documentDirectory')) {
    console.log('✅ localStorage uses documentDirectory');
  }

  // Check error handling
  if (content.includes('try') && content.includes('catch')) {
    console.log('✅ localStorage has error handling');
  }
}

console.log('\n=========================================');
console.log('FileSystem Legacy API Migration:', allFixed ? '✅ COMPLETE' : '⚠️ NEEDS ATTENTION');