export interface Contact {
  id: string;
  name: string;
  jobTitle?: string;
  company: string;
  phone: string; // Primary phone for backward compatibility
  phones?: {
    mobile1?: string;
    mobile2?: string;
    office?: string;
    fax?: string;
  };
  email: string;
  address: string;
  imageUrl: string;
  addedDate: string;
  lastContact?: string;
}

export type Screen = 'Camera' | 'Contacts' | 'Reminders' | 'Profile' | 'ContactForm' | 'ContactDetail';

export interface ContactFormData {
  name: string;
  jobTitle?: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}