/**
 * Phone number formatting utilities for Malaysian numbers
 */

/**
 * Normalize phone number to international format with country code
 * This should be used when STORING phone numbers in the database
 * @param phoneNumber - Raw phone number
 * @param defaultCountryCode - Default country code (default: +60 for Malaysia)
 * @returns Normalized phone number in international format (e.g., +60163038028)
 */
export function normalizePhoneNumber(phoneNumber: string, defaultCountryCode: string = '+60'): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except +
  let cleanPhone = phoneNumber.replace(/[^+\d]/g, '');

  // If already has + and country code, return as-is
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }

  // Extract numeric country code from default (e.g., +60 -> 60)
  const numericCountryCode = defaultCountryCode.replace('+', '');

  // Handle numbers starting with the country code (without +)
  if (cleanPhone.startsWith(numericCountryCode)) {
    return '+' + cleanPhone;
  }

  // Handle Malaysian local numbers (starting with 0)
  if (numericCountryCode === '60') {
    if (cleanPhone.startsWith('0')) {
      // Malaysian local number: 016-3038028 -> +60163038028
      return '+60' + cleanPhone.substring(1);
    }
  }

  // Handle other local numbers (starting with 0)
  if (cleanPhone.startsWith('0')) {
    return defaultCountryCode + cleanPhone.substring(1);
  }

  // Number without country code and doesn't start with 0
  // Assume it needs the default country code
  return defaultCountryCode + cleanPhone;
}

/**
 * Format phone number for WhatsApp with country code
 * This should be used when OPENING WhatsApp (removes the + sign)
 * @param phoneNumber - Raw phone number or normalized phone number
 * @param defaultCountryCode - Default country code (default: 60 for Malaysia)
 * @returns Formatted phone number for WhatsApp (e.g., 60163038028)
 */
export function formatPhoneForWhatsApp(phoneNumber: string, defaultCountryCode: string = '60'): string {
  if (!phoneNumber) return '';

  // First normalize to get consistent format
  const normalized = normalizePhoneNumber(phoneNumber, '+' + defaultCountryCode);

  // Remove + sign for WhatsApp URL
  return normalized.replace('+', '');
}

/**
 * Format phone number for display (human-readable)
 * Supports multiple countries: Malaysia, Singapore, Taiwan, China, USA, Indonesia, Thailand
 * @param phoneNumber - Raw phone number (should be in WhatsApp format: country code + number, no + sign)
 * @returns Formatted phone number for display (e.g., +60 16-303 8028)
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // MALAYSIA (+60)
  if (digits.startsWith('60') && digits.length >= 11) {
    // Mobile: 60123456789 → +60 12-345 6789
    if (digits[2] === '1') {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}-${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
    // Landline: 6031234567 → +60 3-1234 5678
    return `+${digits.slice(0, 2)} ${digits.slice(2, 3)}-${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
  }

  // SINGAPORE (+65)
  if (digits.startsWith('65') && digits.length >= 10) {
    // Mobile/Landline: 6591234567 → +65 9123 4567
    return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
  }

  // TAIWAN (+886)
  if (digits.startsWith('886') && digits.length >= 12) {
    // Mobile: 886912345678 → +886 912-345-678
    if (digits[3] === '9') {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
    }
    // Landline: 886223456789 → +886 2-2345-6789
    return `+${digits.slice(0, 3)} ${digits.slice(3, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
  }

  // CHINA (+86)
  if (digits.startsWith('86') && digits.length >= 13) {
    // Mobile: 8613800138000 → +86 138-0013-8000
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 13)}`;
  }

  // USA/CANADA (+1)
  if (digits.startsWith('1') && digits.length === 11) {
    // 15551234567 → +1 (555) 123-4567
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }

  // INDONESIA (+62)
  if (digits.startsWith('62') && digits.length >= 11) {
    // 628123456789 → +62 812-3456-789
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 12)}`;
  }

  // THAILAND (+66)
  if (digits.startsWith('66') && digits.length >= 11) {
    // 66812345678 → +66 81-234-5678
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }

  // Legacy format: Malaysian local numbers (for backward compatibility)
  // Format Malaysian mobile numbers
  if (digits.startsWith('01') && digits.length === 10) {
    // 10-digit format: 01X-XXX XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  } else if (digits.startsWith('01') && digits.length === 11) {
    // 11-digit format: 01X-XXXX XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
  }

  // Format Malaysian landline numbers (0X-XXXX XXXX)
  if (digits.startsWith('0') && digits.length >= 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  // Return as-is if no pattern matches
  return phoneNumber;
}

/**
 * Validate if a phone number is valid
 * @param phoneNumber - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;

  const digits = phoneNumber.replace(/\D/g, '');

  // Malaysian mobile (10-11 digits starting with 01)
  if (digits.startsWith('01') && (digits.length === 10 || digits.length === 11)) {
    return true;
  }

  // Malaysian landline (9-10 digits starting with 0)
  if (digits.startsWith('0') && (digits.length === 9 || digits.length === 10)) {
    return true;
  }

  // International format with Malaysian country code
  if (digits.startsWith('60') && digits.length >= 11 && digits.length <= 12) {
    return true;
  }

  return false;
}