import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';

// Mock Supabase
jest.mock('../../services/supabaseClient');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no user when not authenticated', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should initialize with user when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      access_token: 'token-123',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.session).toEqual(mockSession);
  });

  it('should handle sign in successfully', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      access_token: 'token-123',
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(signInResult).toEqual({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });
  });

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAuth());

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(signInResult).toEqual({
      data: null,
      error: mockError,
    });
  });

  it('should handle sign up successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'new@example.com',
    };

    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('new@example.com', 'password', {
        name: 'New User',
      });
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: {
        data: {
          name: 'New User',
        },
      },
    });
    expect(signUpResult).toEqual({
      data: { user: mockUser },
      error: null,
    });
  });

  it('should handle sign out successfully', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    let signOutResult;
    await act(async () => {
      signOutResult = await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(signOutResult).toEqual({ error: null });
  });

  it('should update user state on auth state change', async () => {
    const mockInitialSession = null;
    const mockNewSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      access_token: 'token-123',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockInitialSession },
    });

    const mockAuthListener = {
      subscription: {
        unsubscribe: jest.fn(),
      },
    };

    let authStateChangeCallback: any;
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return { data: mockAuthListener };
    });

    const { result } = renderHook(() => useAuth());

    // Initially no user
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();

    // Simulate auth state change
    await act(async () => {
      authStateChangeCallback('SIGNED_IN', mockNewSession);
    });

    // User should be updated
    expect(result.current.user).toEqual(mockNewSession.user);
    expect(result.current.session).toEqual(mockNewSession);
  });
});