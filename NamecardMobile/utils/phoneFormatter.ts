/**
 * Phone number formatting utilities for Malaysian numbers
 */

/**
 * Format phone number for WhatsApp with country code
 * @param phoneNumber - Raw phone number
 * @param defaultCountryCode - Default country code (default: 60 for Malaysia)
 * @returns Formatted phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phoneNumber: string, defaultCountryCode: string = '60'): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except +
  let cleanPhone = phoneNumber.replace(/[^+\d]/g, '');

  // Handle Malaysian numbers
  if (defaultCountryCode === '60') {
    if (cleanPhone.startsWith('01')) {
      // Malaysian mobile number starting with 01
      cleanPhone = '60' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('0')) {
      // Other Malaysian numbers starting with 0
      cleanPhone = '60' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('60') && !cleanPhone.startsWith('+')) {
      // Number without country code, assume Malaysian
      cleanPhone = '60' + cleanPhone;
    } else if (cleanPhone.startsWith('+')) {
      // Remove + sign for WhatsApp URL
      cleanPhone = cleanPhone.substring(1);
    }
  } else {
    // For non-Malaysian numbers
    if (!cleanPhone.startsWith(defaultCountryCode) && !cleanPhone.startsWith('+')) {
      cleanPhone = defaultCountryCode + cleanPhone;
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }
  }

  return cleanPhone;
}

/**
 * Format phone number for display
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Format Malaysian mobile numbers (01X-XXX XXXX)
  if (digits.startsWith('01') && digits.length >= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  // Format Malaysian landline numbers (0X-XXXX XXXX)
  if (digits.startsWith('0') && digits.length >= 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  // Format international numbers with country code
  if (digits.startsWith('60') && digits.length >= 11) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}-${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
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