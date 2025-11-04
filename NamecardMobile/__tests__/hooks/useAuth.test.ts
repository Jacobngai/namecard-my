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

  describe('Additional Edge Cases', () => {
    beforeEach(() => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
    });

    it('should handle network errors during sign in', async () => {
      const mockError = {
        message: 'Network request failed',
        status: 0,
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123');
      });

      expect(signInResult?.error).toEqual(mockError);
    });

    it('should handle sign up with existing email error', async () => {
      const mockError = {
        message: 'User already registered',
        status: 400,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp('existing@example.com', 'password123');
      });

      expect(signUpResult?.error).toEqual(mockError);
    });

    it('should handle weak password error during sign up', async () => {
      const mockError = {
        message: 'Password should be at least 6 characters',
        status: 400,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', '123');
      });

      expect(signUpResult?.error).toEqual(mockError);
    });

    it('should handle sign out errors', async () => {
      const mockError = {
        message: 'Sign out failed',
      };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signOutResult: any;
      await act(async () => {
        signOutResult = await result.current.signOut();
      });

      expect(signOutResult?.error).toEqual(mockError);
    });

    it('should handle SIGNED_OUT auth state change', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      let authStateChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockSession.user);

      // Simulate sign out
      await act(async () => {
        authStateChangeCallback('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should handle TOKEN_REFRESHED auth state change', async () => {
      const mockRefreshedSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'new-token-456',
      };

      let authStateChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate token refresh
      await act(async () => {
        authStateChangeCallback('TOKEN_REFRESHED', mockRefreshedSession);
      });

      expect(result.current.session).toEqual(mockRefreshedSession);
    });

    it('should handle getSession error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (supabase.auth.getSession as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting session:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should unsubscribe from auth listener on unmount', async () => {
      const unsubscribeMock = jest.fn();

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });

      const { result, unmount } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(unsubscribeMock).not.toHaveBeenCalled();

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should sign up without metadata', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp('newuser@example.com', 'password123');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: undefined,
        },
      });
      expect(signUpResult?.error).toBeNull();
    });
  });
});