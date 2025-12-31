/**
 * Standalone test for gibberish detection logic
 * Run with: node test-gibberish.js
 */

function detectGibberish(userMessage) {
  const lowerInput = userMessage.toLowerCase();
  const wordCount = userMessage.trim().split(/\s+/).length;
  const lettersOnly = lowerInput.replace(/[^a-z]/g, '');
  const avgWordLength = userMessage.replace(/\s/g, '').length / wordCount;

  // Signal 1: Repeated character patterns (e.g., "aaaaa", "bbbbb")
  const hasRepeatedChars = /(.)\1{4,}/.test(userMessage);

  // Signal 2: Vowel ratio check - gibberish usually has low vowel ratio
  const vowelCount = (lettersOnly.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / Math.max(lettersOnly.length, 1);
  const veryLowVowelRatio = (vowelRatio < 0.15 && lettersOnly.length > 10) || (vowelRatio === 0 && lettersOnly.length > 5);

  // Signal 3: Random character sequences (many short words with low vowel density)
  const hasRandomSequence = wordCount > 5 && avgWordLength < 8 && vowelRatio < 0.25;

  // Signal 4: Consonant clusters (3+ consonants in a row across multiple words)
  const consonantClusters = (lettersOnly.match(/[^aeiou]{3,}/g) || []).length;
  const hasExcessiveConsonants = consonantClusters >= 2 && lettersOnly.length > 10;

  // Multi-signal scoring (require ANY 2 signals to reject)
  const gibberishSignals = [
    hasRepeatedChars,          // Signal 1: Repeated character patterns
    veryLowVowelRatio,         // Signal 2: Very low vowel ratio (< 20%)
    hasRandomSequence,         // Signal 3: Many short words with low vowels
    hasExcessiveConsonants,    // Signal 4: Many consonant clusters
  ];

  const gibberishScore = gibberishSignals.filter(Boolean).length;
  const isGibberish = gibberishScore >= 2;

  return {
    isGibberish,
    score: gibberishScore,
    signals: {
      avgWordLength: avgWordLength.toFixed(2),
      hasRepeatedChars,
      vowelRatio: vowelRatio.toFixed(2),
      veryLowVowelRatio,
      hasRandomSequence,
      consonantClusters,
      hasExcessiveConsonants
    }
  };
}

// Test cases
const tests = [
  // Should detect as gibberish
  { input: 'dsdsdsdsas asasas asasas asasas ewewbdusb qwqwyquw qwgyqwq w yqwyqwyq qwgqyg', shouldReject: true },
  { input: 'aaaaa bbbbb ccccc', shouldReject: true },
  { input: 'bcdfg hjklm npqrs tvwxz', shouldReject: true },

  // Should NOT detect as gibberish
  { input: 'Hello', shouldReject: false },
  { input: 'I met John about loans', shouldReject: false },
  { input: 'Show my contacts', shouldReject: false },
  { input: 'MaximilianSchwarzeneggerInternationalHoldings', shouldReject: false },
  { input: 'contact@maximilianschwarzeneg.com', shouldReject: false },
  { input: 'https://www.internationalbusinesscorporation.com', shouldReject: false },
  { input: 'PostgreSQL authentication configuration', shouldReject: false },
  { input: 'abc', shouldReject: false },
  { input: 'Woooow that is amazing!', shouldReject: false },
];

console.log('🧪 Testing Gibberish Detection\n');

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = detectGibberish(test.input);
  const testPassed = result.isGibberish === test.shouldReject;

  if (testPassed) {
    passed++;
    console.log(`✅ Test ${index + 1}: PASS`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: FAIL`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected reject: ${test.shouldReject}, Got reject: ${result.isGibberish}`);
    console.log(`   Score: ${result.score}/3`, result.signals);
  }
});

console.log(`\n📊 Results: ${passed}/${tests.length} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ All tests passed! Gibberish detection is working correctly.');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the logic.');
  process.exit(1);
}
