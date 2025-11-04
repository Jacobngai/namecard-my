/**
 * Validation Utility Tests
 *
 * Tests input validation schemas for contacts and authentication
 */

import { ContactValidationSchema, AuthValidationSchema, validateContact, validateAuth } from '../../utils/validation';

describe('Contact Validation', () => {
  it('should validate a valid contact', async () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      position: 'Software Engineer',
      website: 'https://example.com',
      notes: 'Met at conference'
    };

    await expect(ContactValidationSchema.validate(validContact)).resolves.toBeTruthy();
  });

  it('should reject contact without name', async () => {
    const invalidContact = {
      email: 'john@example.com',
      phone: '+1234567890'
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Name is required');
  });

  it('should reject contact with invalid email', async () => {
    const invalidContact = {
      name: 'John Doe',
      email: 'not-an-email'
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Invalid email address');
  });

  it('should reject contact with invalid phone format', async () => {
    const invalidContact = {
      name: 'John Doe',
      phone: 'abc-def-ghij' // Contains letters
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Invalid phone number format');
  });

  it('should reject name that is too long', async () => {
    const invalidContact = {
      name: 'A'.repeat(101) // 101 characters
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Name must be less than 100 characters');
  });

  it('should accept contact with only required fields', async () => {
    const minimalContact = {
      name: 'John Doe'
    };

    await expect(ContactValidationSchema.validate(minimalContact)).resolves.toBeTruthy();
  });

  it('should reject invalid website URL', async () => {
    const invalidContact = {
      name: 'John Doe',
      website: 'not-a-url'
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Invalid website URL');
  });

  it('should accept null optional fields', async () => {
    const contact = {
      name: 'John Doe',
      email: null,
      phone: null,
      company: null
    };

    await expect(ContactValidationSchema.validate(contact)).resolves.toBeTruthy();
  });

  it('should trim name whitespace', async () => {
    const contact = {
      name: '  John Doe  '
    };

    const validated = await ContactValidationSchema.validate(contact);
    expect(validated.name).toBe('John Doe');
  });

  it('should reject notes that are too long', async () => {
    const invalidContact = {
      name: 'John Doe',
      notes: 'A'.repeat(1001) // 1001 characters
    };

    await expect(ContactValidationSchema.validate(invalidContact)).rejects.toThrow('Notes must be less than 1000 characters');
  });
});

describe('Authentication Validation', () => {
  it('should validate correct credentials', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'Password123'
    };

    await expect(AuthValidationSchema.validate(credentials)).resolves.toBeTruthy();
  });

  it('should reject missing email', async () => {
    const credentials = {
      email: '',
      password: 'Password123'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Email is required');
  });

  it('should reject invalid email format', async () => {
    const credentials = {
      email: 'not-an-email',
      password: 'Password123'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Invalid email address');
  });

  it('should reject password shorter than 8 characters', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'Pass1'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Password must be at least 8 characters');
  });

  it('should reject password without uppercase letter', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Password must contain at least one uppercase letter');
  });

  it('should reject password without lowercase letter', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'PASSWORD123'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Password must contain at least one lowercase letter');
  });

  it('should reject password without number', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'PasswordABC'
    };

    await expect(AuthValidationSchema.validate(credentials)).rejects.toThrow('Password must contain at least one number');
  });

  it('should accept strong password', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'StrongPassword123!'
    };

    await expect(AuthValidationSchema.validate(credentials)).resolves.toBeTruthy();
  });
});

describe('Validation Helper Functions', () => {
  it('validateContact should throw error for invalid data', async () => {
    const invalidContact = {
      email: 'invalid-email'
    };

    await expect(validateContact(invalidContact)).rejects.toThrow('Validation failed');
  });

  it('validateAuth should throw error for weak password', async () => {
    await expect(validateAuth('user@example.com', 'weak')).rejects.toThrow('Validation failed');
  });

  it('validateContact should succeed for valid data', async () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    await expect(validateContact(validContact)).resolves.not.toThrow();
  });

  it('validateAuth should succeed for strong credentials', async () => {
    await expect(validateAuth('user@example.com', 'Password123')).resolves.not.toThrow();
  });
});
