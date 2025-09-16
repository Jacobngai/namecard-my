export interface ParsedBusinessCard {
  name: string;
  jobTitle: string;
  company: string;
  phones: {
    mobile1?: string;
    mobile2?: string;
    office?: string;
    fax?: string;
  };
  email: string;
  address: string;
  confidence: {
    overall: number;
    name: number;
    jobTitle: number;
    company: number;
    phones: number;
    email: number;
    address: number;
  };
}

export class EnhancedOCRParser {
  private static readonly PATTERNS = {
    // Email pattern with high accuracy
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

    // Phone patterns for Malaysian numbers
    phone: {
      // Mobile: 01X-XXX XXXX or variations
      mobile: /(?:mobile|hp|h\/p|cell|handphone)[\s:]*([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/gi,
      // Office/Tel patterns
      office: /(?:tel|telephone|office|direct)[\s:]*([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/gi,
      // Fax patterns
      fax: /(?:fax|f)[\s:]*([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/gi,
      // Generic phone pattern (no keyword)
      generic: /\b((?:\+?6?0)?1[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})\b/g,
      // Landline pattern
      landline: /\b((?:\+?6?0)?[23789][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})\b/g
    },

    // Job titles - comprehensive list
    jobTitle: /\b(manager|director|executive|officer|ceo|cto|cfo|president|vp|vice president|engineer|developer|consultant|analyst|coordinator|specialist|supervisor|lead|head|chief|founder|owner|partner|associate|assistant|secretary|accountant|designer|architect|advisor|administrator)\b/i,

    // Company patterns
    company: {
      suffix: /\b(sdn[\s.]?bhd|bhd|inc|incorporated|ltd|limited|llc|corp|corporation|company|enterprise|group|holdings|partners|associates|consultancy|consulting|services|solutions|technologies|international|global)\b/i,
      keywords: /\b(company|corporation|enterprise|firm|agency|studio|lab|workshop|factory|manufacturer)\b/i
    },

    // Address patterns for Malaysia
    address: {
      keywords: /\b(lot|no\.?|jalan|jln|lorong|lrg|persiaran|psn|lebuh|lbh|taman|tmn|kampung|kg|bandar|bdr|seksyen|section|block|blok|tingkat|level|floor|suite|unit)\b/i,
      postcode: /\b[0-9]{5}\b/,
      state: /\b(selangor|kuala lumpur|kl|putrajaya|penang|pulau pinang|johor|jb|kedah|kelantan|melaka|malacca|negeri sembilan|pahang|perak|perlis|sabah|sarawak|terengganu|labuan|wilayah persekutuan)\b/i,
      building: /\b(plaza|tower|menara|building|bangunan|kompleks|center|centre|mall|square|place|court|heights|residency|condominium|apartment|flat)\b/i
    },

    // URL pattern
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
  };

  /**
   * Two-Pass Extraction Strategy
   * Pass 1: Extract and remove definite fields (phones, emails, URLs)
   * Pass 2: Extract contextual fields from cleaned text
   */
  static parseBusinessCard(ocrText: string): ParsedBusinessCard {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Initialize result
    const result: ParsedBusinessCard = {
      name: '',
      jobTitle: '',
      company: '',
      phones: {},
      email: '',
      address: '',
      confidence: {
        overall: 0,
        name: 0,
        jobTitle: 0,
        company: 0,
        phones: 0,
        email: 0,
        address: 0
      }
    };

    // Track which lines to remove
    const linesToRemove = new Set<number>();
    const extractedData = {
      phones: [] as Array<{type: string, value: string, lineIndex: number}>,
      emails: [] as Array<{value: string, lineIndex: number}>,
      urls: [] as Array<{value: string, lineIndex: number}>
    };

    // ============= PASS 1: Extract Definite Fields =============

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Extract emails
      const emailMatches = line.match(this.PATTERNS.email);
      if (emailMatches) {
        extractedData.emails.push({ value: emailMatches[0], lineIndex: index });
        linesToRemove.add(index);
      }

      // Extract phones with type detection
      // Updated regex to handle international format like +886-919-388-269
      const internationalPhoneRegex = /(\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/;
      const standardPhoneRegex = /([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/;

      // Check for mobile with number indicator (Mobile 1, Mobile 2, HP 2, etc.)
      if (/mobile\s*[12]|hp\s*[12]/i.test(line)) {
        const phoneMatch = line.match(internationalPhoneRegex) || line.match(standardPhoneRegex);
        if (phoneMatch) {
          const type = /[2]/.test(line) ? 'mobile2' : 'mobile1';
          extractedData.phones.push({ type, value: this.cleanPhoneNumber(phoneMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        }
      }
      // Check for regular mobile
      else if (/mobile|hp|h\/p|cell|handphone/i.test(line)) {
        const phoneMatch = line.match(internationalPhoneRegex) || line.match(standardPhoneRegex);
        if (phoneMatch) {
          // Assign to mobile1 if empty, otherwise mobile2
          const existingMobile1 = extractedData.phones.find(p => p.type === 'mobile1');
          const type = existingMobile1 ? 'mobile2' : 'mobile1';
          extractedData.phones.push({ type, value: this.cleanPhoneNumber(phoneMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        }
      }
      // Check for office/telephone
      else if (/tel|telephone|office|direct/i.test(line)) {
        const phoneMatch = line.match(/([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/);
        if (phoneMatch) {
          extractedData.phones.push({ type: 'office', value: this.cleanPhoneNumber(phoneMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        }
      }
      // Check for fax
      else if (/fax|f\s*:/i.test(line)) {
        const phoneMatch = line.match(/([0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})/);
        if (phoneMatch) {
          extractedData.phones.push({ type: 'fax', value: this.cleanPhoneNumber(phoneMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        }
      }
      // Check for standalone phone numbers (no keyword)
      else {
        const mobileMatch = line.match(/\b(0?1[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})\b/);
        const landlineMatch = line.match(/\b(0?[23789][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})\b/);

        if (mobileMatch && !this.looksLikeAddress(line)) {
          const existingMobile1 = extractedData.phones.find(p => p.type === 'mobile1');
          const type = existingMobile1 ? 'mobile2' : 'mobile1';
          extractedData.phones.push({ type, value: this.cleanPhoneNumber(mobileMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        } else if (landlineMatch && !this.looksLikeAddress(line)) {
          extractedData.phones.push({ type: 'office', value: this.cleanPhoneNumber(landlineMatch[1]), lineIndex: index });
          linesToRemove.add(index);
        }
      }

      // Extract URLs
      const urlMatches = line.match(this.PATTERNS.url);
      if (urlMatches) {
        extractedData.urls.push({ value: urlMatches[0], lineIndex: index });
        linesToRemove.add(index);
      }
    });

    // Populate extracted phone numbers
    extractedData.phones.forEach(phone => {
      result.phones[phone.type as keyof typeof result.phones] = phone.value;
    });

    // Set email (use first one found)
    if (extractedData.emails.length > 0) {
      result.email = extractedData.emails[0].value.toLowerCase();
      result.confidence.email = 0.95;
    }

    // Set phone confidence
    if (Object.keys(result.phones).length > 0) {
      result.confidence.phones = 0.9;
    }

    // ============= PASS 2: Extract Contextual Fields from Cleaned Text =============

    // Create cleaned lines array (without phone/email lines)
    const cleanedLines = lines.filter((_, index) => !linesToRemove.has(index));

    // Extract name (usually in top 30% of cleaned text)
    const nameRegion = cleanedLines.slice(0, Math.ceil(cleanedLines.length * 0.4));

    // Look for Chinese name first
    let chineseName = '';
    let englishName = '';

    for (const line of nameRegion) {
      const cjkPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;

      // Check for Chinese/Japanese/Korean name
      if (cjkPattern.test(line) && this.looksLikeName(line)) {
        chineseName = line.trim();
      }
      // Check for English name (including comma-separated format)
      else if (this.looksLikeName(line) && !this.PATTERNS.company.suffix.test(line)) {
        englishName = this.cleanName(line);
      }

      // If we found both, stop looking
      if (chineseName && englishName) break;
    }

    // Prefer English name if available, otherwise use Chinese name
    if (englishName) {
      result.name = englishName;
      result.confidence.name = 0.85;
    } else if (chineseName) {
      result.name = chineseName;
      result.confidence.name = 0.8;
    }

    // If still no name found, try a more aggressive search
    if (!result.name) {
      // Look for any line that could be a name in the entire cleaned text
      for (const line of cleanedLines) {
        // Skip if it's clearly not a name
        if (this.PATTERNS.company.suffix.test(line) ||
            this.PATTERNS.address.keywords.test(line) ||
            this.PATTERNS.jobTitle.test(line) ||
            /^(mobile|hp|tel|telephone|fax|phone|cell|email)/i.test(line)) {
          continue;
        }

        // Check if it could be a name (relaxed criteria)
        const words = line.trim().split(/[\s,]+/);
        if (words.length >= 1 && words.length <= 5) {
          // Check if it's mostly letters
          const letterCount = (line.match(/[a-zA-Z\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
          if (letterCount >= line.length * 0.5) {
            result.name = this.cleanName(line);
            result.confidence.name = 0.6;
            break;
          }
        }
      }
    }

    // Extract job title (usually near name)
    for (const line of cleanedLines) {
      if (this.PATTERNS.jobTitle.test(line) && line !== result.name) {
        result.jobTitle = this.cleanJobTitle(line);
        result.confidence.jobTitle = 0.85;
        break;
      }
    }

    // Extract company
    for (const line of cleanedLines) {
      if (this.PATTERNS.company.suffix.test(line) || this.PATTERNS.company.keywords.test(line)) {
        if (line !== result.name && line !== result.jobTitle) {
          result.company = this.cleanCompany(line);
          result.confidence.company = 0.8;
          break;
        }
      }
    }

    // Extract address (from cleaned text only)
    const addressLines: string[] = [];
    let inAddressBlock = false;

    for (const line of cleanedLines) {
      // Skip if it's already extracted as name, title, or company
      if (line === result.name || line === result.jobTitle || line === result.company) {
        continue;
      }

      // Skip lines that contain phone/fax keywords
      if (this.isPhoneRelatedLine(line)) {
        inAddressBlock = false; // Stop address block if we hit a phone line
        continue;
      }

      // Check if line looks like address
      if (this.PATTERNS.address.keywords.test(line) ||
          this.PATTERNS.address.postcode.test(line) ||
          this.PATTERNS.address.state.test(line) ||
          this.PATTERNS.address.building.test(line)) {
        addressLines.push(line);
        inAddressBlock = true;
      }
      // If we're in an address block, include adjacent lines
      else if (inAddressBlock && addressLines.length > 0) {
        // Check if this line is likely part of the address
        if (!this.looksLikeName(line) &&
            !this.PATTERNS.jobTitle.test(line) &&
            !this.isPhoneRelatedLine(line)) {
          addressLines.push(line);
        } else {
          inAddressBlock = false;
        }
      }
    }

    if (addressLines.length > 0) {
      result.address = this.formatAddress(addressLines);
      result.confidence.address = Math.min(0.7 + (addressLines.length * 0.05), 0.9);
    }

    // Calculate overall confidence
    const confidenceValues = Object.values(result.confidence).filter(v => v > 0);
    result.confidence.overall = confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : 0;

    return result;
  }

  // Helper methods

  private static looksLikeAddress(line: string): boolean {
    // Check if line contains address keywords AND doesn't look like a pure phone line
    const hasAddressKeyword = this.PATTERNS.address.keywords.test(line) ||
                             this.PATTERNS.address.postcode.test(line) ||
                             this.PATTERNS.address.state.test(line);

    // Check if it's primarily a phone line (has phone keyword at start)
    const isPhoneLine = /^(mobile|hp|tel|telephone|fax|phone|cell)/i.test(line.trim());

    return hasAddressKeyword && !isPhoneLine;
  }

  private static looksLikeName(line: string): boolean {
    // Handle Chinese/Japanese/Korean names
    const cjkPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
    if (cjkPattern.test(line)) {
      // Chinese/Japanese/Korean text found
      // Check if it's 2-6 characters (typical for CJK names)
      const cjkChars = line.match(cjkPattern) || [];
      if (cjkChars.length >= 2 && cjkChars.length <= 6) {
        // Make sure it's not an address or company
        if (!this.PATTERNS.address.keywords.test(line) &&
            !this.PATTERNS.company.suffix.test(line)) {
          return true;
        }
      }
    }

    // Handle names with comma (e.g., "Lu Lung, Lin" or "Smith, John")
    if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 2 && parts.every(p => p.length > 0)) {
        // Check if both parts look like names
        const hasOnlyLettersAndSpaces = /^[a-zA-Z\s]+$/.test(parts.join(' '));
        if (hasOnlyLettersAndSpaces) {
          return true;
        }
      }
    }

    // Original logic for Western names (adjusted)
    const words = line.split(/[\s,]+/); // Split by space or comma

    // Allow single word names (e.g., "Madonna", "Cher") or up to 5 words
    if (words.length < 1 || words.length > 5) return false;

    // Check if it contains mostly letters (allowing for some special chars)
    // Include CJK characters in the letter count
    const letterCount = (line.match(/[a-zA-Z\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
    const letterRatio = letterCount / line.length;

    // Lower threshold for names (0.6 instead of 0.7)
    if (letterRatio < 0.6) return false;

    // Exclude if it has address or company indicators
    if (this.PATTERNS.address.keywords.test(line)) return false;
    if (this.PATTERNS.company.suffix.test(line)) return false;

    // Check for name-like patterns
    const namePattern = /^[A-Z][a-z]+|^[A-Z]+$/; // Either Title Case or ALL CAPS

    // If single word, check if it's title case or all caps
    if (words.length === 1) {
      return namePattern.test(words[0]) && words[0].length >= 2;
    }

    // For multiple words, at least one should match name pattern
    return words.some(word => namePattern.test(word));
  }

  private static cleanPhoneNumber(phone: string): string {
    // Standardize phone format
    return phone.replace(/[\s.]/g, '-').replace(/--+/g, '-');
  }

  private static cleanName(name: string): string {
    // Clean up name, preserve capitalization
    return name.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static cleanJobTitle(title: string): string {
    // Clean job title, convert to title case if all caps
    const cleaned = title.trim();
    if (cleaned === cleaned.toUpperCase()) {
      return cleaned.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return cleaned;
  }

  private static cleanCompany(company: string): string {
    // Clean company name, preserve important capitalizations
    return company.replace(/\s+/g, ' ').trim();
  }

  private static isPhoneRelatedLine(line: string): boolean {
    // Check if line contains phone/fax related keywords
    const phoneKeywords = /\b(mobile|hp|h\/p|tel|telephone|fax|phone|cell|handphone|direct|whatsapp|wa)\b/i;
    const hasPhoneKeyword = phoneKeywords.test(line);

    // Also check if line ends with phone labels like "Fax No.", "Tel.", etc.
    const endsWithPhoneLabel = /(?:fax|tel|telephone|mobile|hp|phone)\s*(?:no\.?|number)?\s*\.?\s*$/i.test(line);

    return hasPhoneKeyword || endsWithPhoneLabel;
  }

  private static formatAddress(addressLines: string[]): string {
    // Clean and format address lines
    const cleanedLines = addressLines.map(line => {
      // Remove trailing commas and periods
      let cleaned = line.trim().replace(/[,\.]+$/, '');

      // Remove phone/fax remnants that might have slipped through
      cleaned = cleaned.replace(/(?:,\s*)?(?:fax|tel|telephone|mobile|hp)\s*(?:no\.?|number)?\s*\.?\s*$/i, '');

      // Clean up multiple commas
      cleaned = cleaned.replace(/,+/g, ',').trim();

      return cleaned;
    }).filter(line => line.length > 0);

    // Join lines with proper formatting
    // If lines already have commas, don't add extra ones
    let formattedAddress = '';
    for (let i = 0; i < cleanedLines.length; i++) {
      const line = cleanedLines[i];

      if (i === 0) {
        formattedAddress = line;
      } else {
        // Check if previous line ended with comma or current line starts with comma
        const needsComma = !formattedAddress.endsWith(',') && !line.startsWith(',');
        formattedAddress += needsComma ? ', ' + line : ' ' + line;
      }
    }

    // Final cleanup
    formattedAddress = formattedAddress
      .replace(/\s+,/g, ',')  // Remove space before comma
      .replace(/,\s*,+/g, ',') // Remove duplicate commas
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim();

    return formattedAddress;
  }
}