import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContacts } from '../../hooks/useContacts';
import { supabase } from '../../services/supabaseClient';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/supabaseClient');

describe('useContacts Hook', () => {
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
  });

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

  it('should add a new contact', async () => {
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

  it('should search contacts correctly', async () => {
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

    // Search by name
    let searchResults = result.current.searchContacts('John');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('John Doe');

    // Search by company
    searchResults = result.current.searchContacts('Design');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('Jane Smith');

    // Search by email
    searchResults = result.current.searchContacts('techcorp');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].email).toBe('john@techcorp.com');

    // Search with no results
    searchResults = result.current.searchContacts('NonExistent');
    expect(searchResults).toHaveLength(0);
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
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error syncing contacts:',
      expect.any(Error)
    );
    expect(result.current.contacts).toEqual([]);

    consoleSpy.mockRestore();
  });
});