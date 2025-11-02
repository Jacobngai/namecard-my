import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../services/supabaseClient';

const supabase = getSupabaseClient();

export interface Contact {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  imageUri?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isLocal?: boolean;
}

const CONTACTS_STORAGE_KEY = '@namecard_contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load contacts from local storage
  const loadLocalContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local contacts:', error);
    }
    return [];
  };

  // Save contacts to local storage
  const saveLocalContacts = async (contactsToSave: Contact[]) => {
    try {
      await AsyncStorage.setItem(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(contactsToSave)
      );
    } catch (error) {
      console.error('Error saving local contacts:', error);
    }
  };

  // Sync contacts with Supabase
  const syncContacts = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch remote contacts
        const { data: remoteContacts, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', session.user.id);

        if (!error && remoteContacts) {
          // Merge local and remote contacts
          const localContacts = await loadLocalContacts();
          const mergedContacts = mergeContacts(localContacts, remoteContacts);

          setContacts(mergedContacts);
          await saveLocalContacts(mergedContacts);
        }
      } else {
        // Not logged in, use local contacts only
        const localContacts = await loadLocalContacts();
        setContacts(localContacts);
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  // Merge local and remote contacts
  const mergeContacts = (local: Contact[], remote: Contact[]): Contact[] => {
    const contactsMap = new Map<string, Contact>();

    // Add remote contacts first
    remote.forEach(contact => {
      contactsMap.set(contact.id, { ...contact, isLocal: false });
    });

    // Add or update with local contacts
    local.forEach(contact => {
      if (!contactsMap.has(contact.id)) {
        contactsMap.set(contact.id, { ...contact, isLocal: true });
      }
    });

    return Array.from(contactsMap.values());
  };

  // Add new contact
  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: `contact_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLocal: true,
    };

    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    await saveLocalContacts(updatedContacts);

    // Try to sync with Supabase if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert({
            ...newContact,
            user_id: session.user.id,
          })
          .select()
          .single();

        if (data && !error) {
          // Update local contact with server ID
          const finalContacts = updatedContacts.map(c =>
            c.id === newContact.id ? { ...data, isLocal: false } : c
          );
          setContacts(finalContacts);
          await saveLocalContacts(finalContacts);
        }
      } catch (error) {
        console.error('Error syncing new contact:', error);
      }
    }

    return newContact;
  };

  // Update contact
  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === id
        ? { ...contact, ...updates, updatedAt: new Date() }
        : contact
    );

    setContacts(updatedContacts);
    await saveLocalContacts(updatedContacts);

    // Sync with Supabase if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase
          .from('contacts')
          .update(updates)
          .eq('id', id)
          .eq('user_id', session.user.id);
      } catch (error) {
        console.error('Error updating remote contact:', error);
      }
    }
  };

  // Delete contact
  const deleteContact = async (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    await saveLocalContacts(updatedContacts);

    // Delete from Supabase if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);
      } catch (error) {
        console.error('Error deleting remote contact:', error);
      }
    }
  };

  // Search contacts
  const searchContacts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name?.toLowerCase().includes(lowercaseQuery) ||
      contact.company?.toLowerCase().includes(lowercaseQuery) ||
      contact.email?.toLowerCase().includes(lowercaseQuery) ||
      contact.phone?.includes(query)
    );
  };

  useEffect(() => {
    syncContacts();
  }, []);

  return {
    contacts,
    loading,
    syncing,
    addContact,
    updateContact,
    deleteContact,
    searchContacts,
    syncContacts,
  };
};