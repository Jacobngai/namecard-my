import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContacts } from '../../hooks/useContacts';
import { supabase } from '../../services/supabaseClient';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/supabaseClient');

describe('useContacts Hook - Comprehensive Tests', () => {
  const mockContacts = [
    {
      id: 'contact_1',
      name: 'John Doe',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone: '+1234567890',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isLocal: false,
    },
    {
      id: 'contact_2',
      name: 'Jane Smith',
      company: 'Design Studio',
      email: 'jane@design.com',
      phone: '+0987654321',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      isLocal: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initial State', () => {
    it('should initialize with loading true and empty state', () => {
      // Since the hook calls useEffect immediately, we check initial render state
      const { result } = renderHook(() => useContacts());

      // Initial state before any async operations
      expect(result.current.loading).toBe(true);
      expect(result.current.contacts).toEqual([]);
    });

    it('should initialize with empty contacts when no data exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contacts).toEqual([]);
      expect(result.current.syncing).toBe(false);
    });
  });

  describe('Local Storage Operations', () => {
    it('should load contacts from local storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockContacts)
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contacts).toHaveLength(2);
      expect(result.current.contacts[0].name).toBe('John Doe');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@namecard_contacts');
    });

    it('should handle corrupted local storage data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contacts).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contacts).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading local contacts:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Supabase Sync Operations', () => {
    it('should sync contacts with Supabase when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockContacts,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith('contacts');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.current.contacts).toHaveLength(2);
    });

    it('should merge local and remote contacts correctly', async () => {
      const localContacts = [
        { ...mockContacts[0], isLocal: true },
      ];
      const remoteContacts = [
        mockContacts[1],
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(localContacts)
      );

      const mockSession = {
        user: { id: 'user-123' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: remoteContacts,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have both contacts
      expect(result.current.contacts).toHaveLength(2);

      // Remote contact should not be marked as local
      const remoteContact = result.current.contacts.find(c => c.id === 'contact_2');
      expect(remoteContact?.isLocal).toBe(false);

      // Local contact should still be there (not synced yet)
      const localContact = result.current.contacts.find(c => c.id === 'contact_1');
      expect(localContact).toBeDefined();
    });

    it('should handle sync errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still work even with sync errors
      expect(result.current.contacts).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('should set syncing state during sync', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      let resolveSync: any;
      const syncPromise = new Promise((resolve) => {
        resolveSync = resolve;
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(() => syncPromise),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      // Wait a bit for syncing to start
      await waitFor(() => {
        expect(result.current.syncing).toBe(true);
      });

      // Resolve the sync
      resolveSync({ data: mockContacts, error: null });

      await waitFor(() => {
        expect(result.current.syncing).toBe(false);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Add Contact', () => {
    it('should add a new contact locally', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '+1111111111',
      };

      let addedContact;
      await act(async () => {
        addedContact = await result.current.addContact(newContact);
      });

      expect(result.current.contacts).toHaveLength(1);
      expect(result.current.contacts[0].name).toBe('New Contact');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should generate a unique ID for new contact', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '+1111111111',
      };

      await act(async () => {
        await result.current.addContact(newContact);
      });

      expect(result.current.contacts[0].id).toMatch(/^contact_\d+$/);
    });

    it('should sync new contact to Supabase when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      // First call for initial sync
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Second call for addContact
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
      });

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'server-123', name: 'New Contact' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockInsertQuery);

      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '+1111111111',
      };

      await act(async () => {
        await result.current.addContact(newContact);
      });

      expect(mockInsertQuery.insert).toHaveBeenCalled();
    });

    it('should mark contact as local when sync fails', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock insert failure
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockInsertQuery);

      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '+1111111111',
      };

      await act(async () => {
        await result.current.addContact(newContact);
      });

      // Should still add contact locally even if sync fails
      expect(result.current.contacts[0].isLocal).toBe(true);
      expect(result.current.contacts).toHaveLength(1);
    });
  });

  describe('Update Contact', () => {
    it('should update an existing contact', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockContacts[0]])
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateContact('contact_1', {
          name: 'John Updated',
          email: 'john.updated@techcorp.com',
        });
      });

      expect(result.current.contacts[0].name).toBe('John Updated');
      expect(result.current.contacts[0].email).toBe('john.updated@techcorp.com');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockContacts[0]])
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalUpdatedAt = result.current.contacts[0].updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.updateContact('contact_1', {
          name: 'John Updated',
        });
      });

      expect(result.current.contacts[0].updatedAt).not.toEqual(originalUpdatedAt);
    });

    it('should sync update to Supabase when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockContacts[0]])
      );

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockContacts[0]],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockUpdateQuery);

      await act(async () => {
        await result.current.updateContact('contact_1', {
          name: 'John Updated',
        });
      });

      expect(mockUpdateQuery.update).toHaveBeenCalled();
      expect(mockUpdateQuery.eq).toHaveBeenCalledWith('id', 'contact_1');
    });

    it('should handle non-existent contact gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockContacts[0]])
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateContact('non-existent', {
          name: 'Should Not Update',
        });
      });

      // Contact should remain unchanged
      expect(result.current.contacts[0].name).toBe('John Doe');
    });
  });

  describe('Delete Contact', () => {
    it('should delete a contact', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockContacts)
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contacts).toHaveLength(2);

      await act(async () => {
        await result.current.deleteContact('contact_1');
      });

      expect(result.current.contacts).toHaveLength(1);
      expect(result.current.contacts[0].id).toBe('contact_2');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should sync delete to Supabase when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockContacts)
      );

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockContacts,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockDeleteQuery);

      await act(async () => {
        await result.current.deleteContact('contact_1');
      });

      expect(mockDeleteQuery.delete).toHaveBeenCalled();
      expect(mockDeleteQuery.eq).toHaveBeenCalledWith('id', 'contact_1');
    });

    it('should handle deleting non-existent contact', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockContacts[0]])
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteContact('non-existent');
      });

      // Should still have the original contact
      expect(result.current.contacts).toHaveLength(1);
      expect(result.current.contacts[0].id).toBe('contact_1');
    });
  });

  describe('Search Contacts', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockContacts)
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
    });

    it('should search contacts by name', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('John');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('John Doe');
    });

    it('should search contacts by company', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('Design');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Jane Smith');
    });

    it('should search contacts by email', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('techcorp');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].email).toBe('john@techcorp.com');
    });

    it('should search contacts by phone', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('1234567890');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].phone).toBe('+1234567890');
    });

    it('should be case insensitive', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('JOHN');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('John Doe');
    });

    it('should return empty array when no matches found', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('NonExistent');
      expect(searchResults).toHaveLength(0);
    });

    it('should handle empty search query', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('');
      expect(searchResults).toHaveLength(2);
    });

    it('should handle special characters in search', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchResults = result.current.searchContacts('@');
      expect(searchResults).toHaveLength(2); // Both have @ in email
    });

    it('should handle undefined/null fields gracefully', async () => {
      const contactWithNulls = [{
        ...mockContacts[0],
        company: undefined,
        email: undefined,
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(contactWithNulls)
      );

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not crash
      const searchResults = result.current.searchContacts('John');
      expect(searchResults).toHaveLength(1);
    });
  });

  describe('Manual Sync', () => {
    it('should manually trigger sync', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockContacts,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      jest.clearAllMocks();

      await act(async () => {
        await result.current.syncContacts();
      });

      expect(supabase.from).toHaveBeenCalledWith('contacts');
    });
  });
});