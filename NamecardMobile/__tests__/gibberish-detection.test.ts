/**
 * Unit tests for gibberish detection logic
 * Tests the multi-signal scoring system used in ChatbotScreen.tsx
 */

describe('Gibberish Detection', () => {
  const detectGibberish = (userMessage: string): { isGibberish: boolean; score: number } => {
    const lowerInput = userMessage.toLowerCase();
    const wordCount = userMessage.trim().split(/\s+/).length;

    // Signal 1: Average word length check
    const avgWordLength = userMessage.replace(/\s/g, '').length / wordCount;

    // Signal 2: Repeated character check
    const hasRepeatedChars = /(.)\1{4,}/.test(userMessage);

    // Signal 3: Vowel ratio check
    const lettersOnly = lowerInput.replace(/[^a-z]/g, '');
    const vowelCount = (lettersOnly.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowelCount / Math.max(lettersOnly.length, 1);
    const lowVowelRatio = vowelRatio < 0.25 && lettersOnly.length > 5;

    // Multi-signal scoring (require 2+ signals to reject)
    const gibberishSignals = [
      avgWordLength > 12,
      hasRepeatedChars,
      lowVowelRatio,
    ];

    const gibberishScore = gibberishSignals.filter(Boolean).length;
    const isGibberish = gibberishScore >= 2;

    return { isGibberish, score: gibberishScore };
  };

  describe('Should detect gibberish', () => {
    it('should detect random keyboard mashing', () => {
      const result = detectGibberish('dsdsdsdsas asasas asasas asasas ewewbdusb qwqwyquw qwgyqwq w yqwyqwyq qwgqyg');
      expect(result.isGibberish).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('should detect repeated character spam', () => {
      const result = detectGibberish('aaaaa bbbbb ccccc');
      expect(result.isGibberish).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('should detect consonant-heavy nonsense', () => {
      const result = detectGibberish('bcdfg hjklm npqrs tvwxz');
      expect(result.isGibberish).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Should NOT detect as gibberish (legitimate input)', () => {
    it('should allow normal greetings', () => {
      const result = detectGibberish('Hello');
      expect(result.isGibberish).toBe(false);
    });

    it('should allow normal conversation', () => {
      const result = detectGibberish('I met John about loans');
      expect(result.isGibberish).toBe(false);
    });

    it('should allow contact queries', () => {
      const result = detectGibberish('Show my contacts');
      expect(result.isGibberish).toBe(false);
    });

    it('should allow long proper nouns', () => {
      const result = detectGibberish('MaximilianSchwarzeneggerInternationalHoldings');
      expect(result.isGibberish).toBe(false);
      // Should only trigger avgWordLength signal (1/3), not enough for rejection
    });

    it('should allow email addresses', () => {
      const result = detectGibberish('contact@maximilianschwarzeneg.com');
      expect(result.isGibberish).toBe(false);
    });

    it('should allow URLs', () => {
      const result = detectGibberish('https://www.internationalbusinesscorporation.com');
      expect(result.isGibberish).toBe(false);
    });

    it('should allow technical terms', () => {
      const result = detectGibberish('PostgreSQL authentication configuration');
      expect(result.isGibberish).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle very short input', () => {
      const result = detectGibberish('abc');
      expect(result.isGibberish).toBe(false);
      // Very short inputs should be ignored by lowVowelRatio check
    });

    it('should handle empty string', () => {
      const result = detectGibberish('');
      expect(result.isGibberish).toBe(false);
    });

    it('should handle numbers and symbols', () => {
      const result = detectGibberish('123 456 789 !@# $%^');
      expect(result.isGibberish).toBe(false);
      // No letters = vowelRatio is 0, but lettersOnly.length is 0, so lowVowelRatio is false
    });

    it('should require multiple signals to reject', () => {
      // Only long average word length (1 signal)
      const result1 = detectGibberish('Internationalization');
      expect(result1.isGibberish).toBe(false);
      expect(result1.score).toBeLessThan(2);

      // Only repeated chars (1 signal)
      const result2 = detectGibberish('Woooow that is amazing!');
      expect(result2.isGibberish).toBe(false);
      expect(result2.score).toBeLessThan(2);
    });
  });
});
