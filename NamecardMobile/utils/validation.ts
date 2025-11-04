import * as Yup from 'yup';

/**
 * Contact Validation Schema
 * Validates contact information with proper business rules
 */
export const ContactValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .trim()
    .max(100, 'Name must be less than 100 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .nullable()
    .max(255, 'Email must be less than 255 characters'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .nullable()
    .max(20, 'Phone number must be less than 20 characters'),
  company: Yup.string()
    .nullable()
    .max(100, 'Company name must be less than 100 characters'),
  position: Yup.string()
    .nullable()
    .max(100, 'Position must be less than 100 characters'),
  website: Yup.string()
    .url('Invalid website URL')
    .nullable()
    .max(255, 'Website URL must be less than 255 characters'),
  notes: Yup.string()
    .nullable()
    .max(1000, 'Notes must be less than 1000 characters'),
});

/**
 * Authentication Validation Schema
 * Validates email and password for authentication
 */
export const AuthValidationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .max(100, 'Password must be less than 100 characters'),
});

/**
 * Validate contact data
 * @param data Contact data to validate
 * @returns Validated contact data
 * @throws ValidationError if validation fails
 */
export async function validateContact(data: any): Promise<any> {
  try {
    return await ContactValidationSchema.validate(data, { abortEarly: false });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new Error('Validation failed: ' + err.errors.join(', '));
    }
    throw new Error('Validation failed');
  }
}

/**
 * Validate authentication credentials
 * @param email Email address
 * @param password Password
 * @returns Validated credentials
 * @throws ValidationError if validation fails
 */
export async function validateAuth(email: string, password: string): Promise<{ email: string; password: string }> {
  try {
    return await AuthValidationSchema.validate({ email, password }, { abortEarly: false });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new Error('Validation failed: ' + err.errors.join(', '));
    }
    throw new Error('Validation failed');
  }
}

// Backwards compatibility exports
export const contactSchema = ContactValidationSchema;
export const authSchema = AuthValidationSchema;
