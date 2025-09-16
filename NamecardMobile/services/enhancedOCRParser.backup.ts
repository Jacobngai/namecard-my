import { Contact } from '../types';

interface TextBlock {
  text: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  lineNumber: number;
  fontSize?: number;
}

interface FieldCandidate {
  value: string;
  confidence: number;
  source: string[];
  position?: number;
}

interface FieldCandidates {
  name: FieldCandidate[];
  jobTitle: FieldCandidate[];
  company: FieldCandidate[];
  phone: FieldCandidate[];
  email: FieldCandidate[];
  address: FieldCandidate[];
}

interface ParsedBusinessCard {
  name: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  confidence: {
    overall: number;
    name: number;
    jobTitle: number;
    company: number;
    phone: number;
    email: number;
    address: number;
  };
}

export class EnhancedOCRParser {
  // Pattern definitions for Malaysian business cards
  private static readonly PATTERNS = {
    // Email pattern
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,

    // Malaysian phone patterns
    phone: {
      mobile: /(?:\+?6?0)?1[0-9]-?\s?[0-9]{3,4}\s?[0-9]{4}/,
      landline: /(?:\+?6?0)?[3-9]-?\s?[0-9]{3,4}\s?[0-9]{4}/,
      fax: /(?:fax|f)[\s:]*(?:\+?6?0)?[3-9]-?\s?[0-9]{3,4}\s?[0-9]{4}/i,
      general: /(?:\+?[0-9]{1,3}[-.\s]?)?(?:\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{4}/
    },

    // Job title patterns
    jobTitle: /\b(manager|director|executive|officer|ceo|cto|cfo|president|vp|vice president|engineer|developer|consultant|analyst|coordinator|specialist|supervisor|lead|head|chief|founder|owner|partner|associate|assistant|secretary|accountant|designer|architect|advisor|administrator)\b/i,

    // Company patterns for Malaysian context
    company: {
      suffix: /\b(sdn\.?\s?bhd|bhd|berhad|inc|corp|corporation|llc|ltd|limited|company|co\.?|llp|group|enterprises|solutions|services|consulting|technologies|tech|systems|associates|partners|trading|industries|holdings|ventures)\b\.?/i,
      prefix: /\b(pt|cv|pte|pvt)\b\.?\s/i
    },

    // Malaysian address patterns
    address: {
      keywords: /\b(lot|no\.?|jalan|jln|lorong|lrg|taman|tmn|kampung|kg|bandar|section|seksyen|block|blok|level|floor|suite|unit)\b/i,
      postcode: /\b[0-9]{5}\b/,
      state: /\b(selangor|kuala lumpur|kl|putrajaya|penang|pulau pinang|johor|kedah|kelantan|melaka|malacca|negeri sembilan|pahang|perak|perlis|sabah|sarawak|terengganu|labuan)\b/i
    },

    // Name patterns
    name: {
      // Common name formats (handles various cases)
      standard: /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/,
      allCaps: /^[A-Z]+(?:\s+[A-Z]+){1,3}$/,
      mixed: /^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$/,
      withTitle: /^(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?|Ir\.?|Dato|Datuk|Tan Sri)\s+[A-Za-z]+(?:\s+[A-Za-z]+){1,3}/i,
      chinese: /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/ // Romanized Chinese names
    }
  };

  /**
   * Strategy 1: Pattern Recognition
   * Identify fields based on common patterns in business cards
   */
  private static applyPatternRecognition(lines: string[]): FieldCandidates {
    const candidates: FieldCandidates = {
      name: [],
      jobTitle: [],
      company: [],
      phone: [],
      email: [],
      address: []
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Email detection (highest confidence)
      const emailMatch = trimmedLine.match(this.PATTERNS.email);
      if (emailMatch) {
        candidates.email.push({
          value: emailMatch[0],
          confidence: 0.95,
          source: ['pattern_email'],
          position: index
        });
      }

      // Phone detection with type differentiation
      if (this.PATTERNS.phone.mobile.test(trimmedLine)) {
        const match = trimmedLine.match(this.PATTERNS.phone.mobile);
        if (match) {
          candidates.phone.push({
            value: match[0],
            confidence: 0.9,
            source: ['pattern_mobile'],
            position: index
          });
        }
      } else if (this.PATTERNS.phone.landline.test(trimmedLine)) {
        const match = trimmedLine.match(this.PATTERNS.phone.landline);
        if (match && !trimmedLine.toLowerCase().includes('fax')) {
          candidates.phone.push({
            value: match[0],
            confidence: 0.75,
            source: ['pattern_landline'],
            position: index
          });
        }
      }

      // Job title detection
      if (this.PATTERNS.jobTitle.test(trimmedLine)) {
        candidates.jobTitle.push({
          value: trimmedLine,
          confidence: 0.8,
          source: ['pattern_title'],
          position: index
        });
      }

      // Company detection
      if (this.PATTERNS.company.suffix.test(trimmedLine) ||
          this.PATTERNS.company.prefix.test(trimmedLine)) {
        candidates.company.push({
          value: trimmedLine,
          confidence: 0.85,
          source: ['pattern_company'],
          position: index
        });
      }

      // Address detection
      if (this.PATTERNS.address.keywords.test(trimmedLine) ||
          this.PATTERNS.address.postcode.test(trimmedLine) ||
          this.PATTERNS.address.state.test(trimmedLine)) {
        candidates.address.push({
          value: trimmedLine,
          confidence: 0.7,
          source: ['pattern_address'],
          position: index
        });
      }

      // Name detection (multiple patterns)
      const isLikelyName =
        this.PATTERNS.name.standard.test(trimmedLine) ||
        this.PATTERNS.name.allCaps.test(trimmedLine) ||
        this.PATTERNS.name.mixed.test(trimmedLine) ||
        this.PATTERNS.name.withTitle.test(trimmedLine) ||
        this.PATTERNS.name.chinese.test(trimmedLine);

      if (isLikelyName &&
          !this.PATTERNS.company.suffix.test(trimmedLine) &&
          !this.PATTERNS.jobTitle.test(trimmedLine) &&
          !this.PATTERNS.address.keywords.test(trimmedLine)) {
        candidates.name.push({
          value: trimmedLine,
          confidence: index < 3 ? 0.8 : 0.6, // Higher confidence if near top
          source: ['pattern_name'],
          position: index
        });
      }
    });

    return candidates;
  }

  /**
   * Strategy 2: Contextual Analysis
   * Use relationships between fields to improve accuracy
   */
  private static applyContextualAnalysis(
    candidates: FieldCandidates,
    lines: string[]
  ): FieldCandidates {
    // Email domain to company correlation
    if (candidates.email.length > 0) {
      const email = candidates.email[0].value;
      const domain = email.split('@')[1]?.split('.')[0];

      if (domain) {
        // Look for company names containing the domain
        candidates.company.forEach(company => {
          if (company.value.toLowerCase().includes(domain.toLowerCase())) {
            company.confidence += 0.2;
            company.source.push('email_domain_match');
          }
        });

        // Check if domain appears in lines not yet identified as company
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(domain.toLowerCase()) &&
              !candidates.company.some(c => c.value === line)) {
            candidates.company.push({
              value: line,
              confidence: 0.7,
              source: ['email_domain_correlation'],
              position: index
            });
          }
        });

        // Email prefix often matches first name
        const emailPrefix = email.split('@')[0].toLowerCase();
        candidates.name.forEach(name => {
          const firstName = name.value.split(' ')[0].toLowerCase();
          if (emailPrefix.includes(firstName) || firstName.includes(emailPrefix)) {
            name.confidence += 0.15;
            name.source.push('email_prefix_match');
          }
        });
      }
    }

    // Job title proximity to name
    if (candidates.jobTitle.length > 0) {
      candidates.jobTitle.forEach(title => {
        // Check line before and after for potential names
        const titlePos = title.position || 0;

        candidates.name.forEach(name => {
          const namePos = name.position || 0;
          if (Math.abs(namePos - titlePos) === 1) {
            name.confidence += 0.2;
            name.source.push('title_proximity');
            title.confidence += 0.1;
            title.source.push('name_proximity');
          }
        });

        // If no name found near title, check adjacent lines
        if (titlePos > 0 && !candidates.name.some(n => n.position === titlePos - 1)) {
          const prevLine = lines[titlePos - 1];
          if (prevLine && !this.PATTERNS.company.suffix.test(prevLine)) {
            candidates.name.push({
              value: prevLine,
              confidence: 0.65,
              source: ['adjacent_to_title'],
              position: titlePos - 1
            });
          }
        }
      });
    }

    return candidates;
  }

  /**
   * Strategy 3: Hierarchical Processing
   * Process information in levels from spatial to semantic
   */
  private static applyHierarchicalProcessing(
    candidates: FieldCandidates,
    lines: string[]
  ): FieldCandidates {
    // Level 1: Segment into regions (top, middle, bottom)
    const topRegion = lines.slice(0, Math.floor(lines.length * 0.4));
    const middleRegion = lines.slice(Math.floor(lines.length * 0.4), Math.floor(lines.length * 0.7));
    const bottomRegion = lines.slice(Math.floor(lines.length * 0.7));

    // Level 2: Boost confidence based on expected positions
    candidates.name.forEach(name => {
      const pos = name.position || 0;
      if (pos < topRegion.length) {
        name.confidence += 0.15;
        name.source.push('top_region');
      }
    });

    candidates.company.forEach(company => {
      const pos = company.position || 0;
      if (pos >= topRegion.length && pos < topRegion.length + middleRegion.length) {
        company.confidence += 0.1;
        company.source.push('middle_region');
      }
    });

    candidates.address.forEach(address => {
      const pos = address.position || 0;
      if (pos >= lines.length - bottomRegion.length) {
        address.confidence += 0.1;
        address.source.push('bottom_region');
      }
    });

    // Level 3: Entity classification reinforcement
    // If multiple related fields cluster together, boost confidence
    const phoneEmailCluster = candidates.phone.concat(candidates.email);
    if (phoneEmailCluster.length >= 2) {
      const positions = phoneEmailCluster.map(c => c.position || 0);
      const minPos = Math.min(...positions);
      const maxPos = Math.max(...positions);

      if (maxPos - minPos <= 2) {
        phoneEmailCluster.forEach(item => {
          item.confidence += 0.05;
          item.source.push('contact_cluster');
        });
      }
    }

    return candidates;
  }

  /**
   * Strategy 4: Cross-field Validation
   * Validate and resolve conflicts between field assignments
   */
  private static applyCrossFieldValidation(candidates: FieldCandidates): ParsedBusinessCard {
    const result: ParsedBusinessCard = {
      name: '',
      jobTitle: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      confidence: {
        overall: 0,
        name: 0,
        jobTitle: 0,
        company: 0,
        phone: 0,
        email: 0,
        address: 0
      }
    };

    // Select best candidate for each field based on confidence
    const selectBest = (fieldCandidates: FieldCandidate[]): { value: string; confidence: number } => {
      if (fieldCandidates.length === 0) return { value: '', confidence: 0 };

      // Sort by confidence and return highest
      const sorted = fieldCandidates.sort((a, b) => b.confidence - a.confidence);
      return { value: sorted[0].value, confidence: Math.min(sorted[0].confidence, 1) };
    };

    // Process email first (usually most reliable)
    const emailResult = selectBest(candidates.email);
    result.email = emailResult.value;
    result.confidence.email = emailResult.confidence;

    // Process company with email domain validation
    if (result.email) {
      const domain = result.email.split('@')[1]?.split('.')[0]?.toLowerCase();
      if (domain) {
        // Boost companies that match email domain
        candidates.company.forEach(company => {
          if (company.value.toLowerCase().includes(domain)) {
            company.confidence = Math.min(company.confidence + 0.3, 1);
          }
        });
      }
    }
    const companyResult = selectBest(candidates.company);
    result.company = companyResult.value;
    result.confidence.company = companyResult.confidence;

    // Process name with email validation
    if (result.email) {
      const emailPrefix = result.email.split('@')[0].toLowerCase();
      candidates.name.forEach(name => {
        const nameParts = name.value.toLowerCase().split(' ');
        if (nameParts.some(part => emailPrefix.includes(part))) {
          name.confidence = Math.min(name.confidence + 0.2, 1);
        }
      });
    }

    // Filter out company from name candidates
    const filteredNameCandidates = candidates.name.filter(
      name => name.value !== result.company
    );
    const nameResult = selectBest(filteredNameCandidates);
    result.name = nameResult.value;
    result.confidence.name = nameResult.confidence;

    // Process job title
    const titleResult = selectBest(candidates.jobTitle);
    result.jobTitle = titleResult.value;
    result.confidence.jobTitle = titleResult.confidence;

    // Process phone (prefer mobile over landline)
    const phoneResult = selectBest(candidates.phone);
    result.phone = phoneResult.value;
    result.confidence.phone = phoneResult.confidence;

    // Process address (combine multiple address lines)
    const addressCandidates = candidates.address.filter(
      addr => addr.value !== result.company && addr.value !== result.name
    );

    if (addressCandidates.length > 1) {
      // Combine address lines that are close together
      const sortedByPosition = addressCandidates.sort((a, b) =>
        (a.position || 0) - (b.position || 0)
      );

      const combinedAddress: string[] = [];
      let lastPosition = -2;

      sortedByPosition.forEach(addr => {
        const pos = addr.position || 0;
        if (pos - lastPosition <= 1) {
          combinedAddress.push(addr.value);
        }
        lastPosition = pos;
      });

      if (combinedAddress.length > 0) {
        result.address = combinedAddress.join(', ');
        result.confidence.address = Math.max(...addressCandidates.map(a => a.confidence));
      }
    } else {
      const addressResult = selectBest(addressCandidates);
      result.address = addressResult.value;
      result.confidence.address = addressResult.confidence;
    }

    // Calculate overall confidence
    const fieldConfidences = [
      result.confidence.name,
      result.confidence.company,
      result.confidence.phone,
      result.confidence.email,
      result.confidence.address,
      result.confidence.jobTitle
    ];

    const validFields = fieldConfidences.filter(c => c > 0);
    result.confidence.overall = validFields.length > 0
      ? validFields.reduce((sum, c) => sum + c, 0) / validFields.length
      : 0;

    return result;
  }

  /**
   * Main parsing method that combines all strategies
   */
  public static parseBusinessCard(text: string): ParsedBusinessCard {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    // Apply all strategies in sequence
    let candidates = this.applyPatternRecognition(lines);
    candidates = this.applyContextualAnalysis(candidates, lines);
    candidates = this.applyHierarchicalProcessing(candidates, lines);

    // Final validation and field assignment
    const result = this.applyCrossFieldValidation(candidates);

    // Post-processing cleanup
    result.name = this.cleanName(result.name);
    result.company = this.cleanCompany(result.company);
    result.phone = this.cleanPhone(result.phone);
    result.address = this.cleanAddress(result.address);

    console.log('Enhanced OCR Parse Result:', {
      fields: result,
      confidence: result.confidence
    });

    return result;
  }

  /**
   * Clean and format extracted name
   */
  private static cleanName(name: string): string {
    if (!name) return '';

    // Remove common titles if at the beginning
    name = name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?|Ir\.?)\s+/i, '');

    // Proper case formatting
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /**
   * Clean and format company name
   */
  private static cleanCompany(company: string): string {
    if (!company) return '';

    // Preserve common acronyms
    const acronyms = ['SDN', 'BHD', 'LLC', 'LTD', 'INC', 'CORP', 'CO', 'LLP'];
    let cleaned = company;

    acronyms.forEach(acronym => {
      const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
      cleaned = cleaned.replace(regex, acronym);
    });

    return cleaned.trim();
  }

  /**
   * Clean and format phone number
   */
  private static cleanPhone(phone: string): string {
    if (!phone) return '';

    // Remove common prefixes
    phone = phone.replace(/^(tel|phone|mobile|hp|fax)[\s:]+/i, '');

    // Format Malaysian numbers
    if (phone.match(/^6?0/)) {
      // Remove country code if present
      phone = phone.replace(/^6?0/, '0');
    }

    return phone.trim();
  }

  /**
   * Clean and format address
   */
  private static cleanAddress(address: string): string {
    if (!address) return '';

    // Remove duplicate commas and spaces
    return address
      .replace(/,\s*,/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
  }
}