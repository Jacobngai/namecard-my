import * as SecureStore from 'expo-secure-store';
import { AuthManager } from '../../services/authManager';
import { getSupabaseClient } from '../../services/supabaseClient';

jest.mock('expo-secure-store');
jest.mock('../../services/supabaseClient');
jest.mock('../../services/supabase', () => ({
  SupabaseService: {
    getClient: jest.fn(),
  },
}));

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    setSession: jest.fn(),
    refreshSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
};

describe('AuthManager Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    // Mock SupabaseService.getClient as well
    const { SupabaseService } = require('../../services/supabase');
    SupabaseService.getClient.mockReturnValue(mockSupabaseClient);
    (AuthManager as any).sessionCache = null;
  });

  describe('storeSession', () => {
    it('should store session in SecureStore', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      await AuthManager.storeSession(mockSession);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_session',
        expect.stringContaining('user-123')
      );
    });

    it('should not store null session', async () => {
      await AuthManager.storeSession(null);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should handle SecureStore errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('SecureStore error'));

      const mockSession = {
        user: { id: 'user-123' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: new Date().toISOString(),
      };

      await AuthManager.storeSession(mockSession);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStoredSession', () => {
    it('should retrieve session from SecureStore', async () => {
      const mockStoredSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() + 3600000,
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockStoredSession)
      );

      const session = await AuthManager.getStoredSession();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_session');
      expect(session).toEqual(mockStoredSession);
    });

    it('should return null if no session stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const session = await AuthManager.getStoredSession();
      expect(session).toBeNull();
    });

    it('should return cached session if available', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() + 3600000,
      };

      (AuthManager as any).sessionCache = mockSession;
      const session = await AuthManager.getStoredSession();
      expect(session).toEqual(mockSession);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('should clear session from SecureStore', async () => {
      await AuthManager.clearSession();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_session');
    });

    it('should clear session cache', async () => {
      (AuthManager as any).sessionCache = { user: { id: 'user-123' } };
      await AuthManager.clearSession();
      expect((AuthManager as any).sessionCache).toBeNull();
    });
  });

  describe('verifySession', () => {
    it('should return user if session is valid', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = {
        user: mockUser,
        access_token: 'token-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthManager.verifySession();
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should return error if no session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await AuthManager.verifySession();
      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

      const result = await AuthManager.verifySession();
      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('setupAuthListener', () => {
    it('should setup auth state change listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const unsubscribe = AuthManager.setupAuthListener(mockCallback);
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback on SIGNED_IN event', async () => {
      const mockCallback = jest.fn();
      const mockSession = {
        user: { id: 'user-123' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: new Date().toISOString(),
      };

      let authStateChangeCallback: any;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      AuthManager.setupAuthListener(mockCallback);

      await authStateChangeCallback('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith(mockSession.user);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should call callback on TOKEN_REFRESHED event', async () => {
      const mockCallback = jest.fn();
      const mockSession = {
        user: { id: 'user-123' },
        access_token: 'new-token',
      };

      let authStateChangeCallback: any;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      AuthManager.setupAuthListener(mockCallback);

      await authStateChangeCallback('TOKEN_REFRESHED', mockSession);

      expect(mockCallback).toHaveBeenCalledWith(mockSession.user);
    });

    it('should call callback on SIGNED_OUT event', async () => {
      const mockCallback = jest.fn();

      let authStateChangeCallback: any;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      AuthManager.setupAuthListener(mockCallback);

      await authStateChangeCallback('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('restoreSession', () => {
    it('should restore valid non-expired session', async () => {
      const mockStoredSession = {
        user: { id: 'user-123' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() + 3600000,
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockStoredSession)
      );

      const session = await AuthManager.restoreSession();

      expect(session).toBeTruthy();
      expect(session.user).toEqual(mockStoredSession.user);
      expect(session.access_token).toBe(mockStoredSession.accessToken);
    });

    it('should return null if no stored session', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const session = await AuthManager.restoreSession();

      expect(session).toBeNull();
    });

    it('should refresh expired session', async () => {
      const expiredSession = {
        user: { id: 'user-123' },
        accessToken: 'old-token',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() - 1000, // Expired
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(expiredSession)
      );

      const refreshedSession = {
        user: { id: 'user-123' },
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession },
        error: null,
      });

      const session = await AuthManager.restoreSession();

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: expiredSession.refreshToken,
      });
      expect(session).toBeTruthy();
      expect(session.access_token).toBe(refreshedSession.access_token);
    });

    it('should clear session if refresh fails', async () => {
      const expiredSession = {
        user: { id: 'user-123' },
        accessToken: 'old-token',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() - 1000,
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(expiredSession)
      );

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh failed' },
      });

      const session = await AuthManager.restoreSession();

      expect(session).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('verifySession - advanced scenarios', () => {
    it('should refresh session if expiring soon', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const expiringSoonSession = {
        user: mockUser,
        access_token: 'old-token',
        expires_at: new Date(Date.now() + 30000).toISOString(), // 30 seconds
      };

      const refreshedSession = {
        user: mockUser,
        access_token: 'new-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: expiringSoonSession },
        error: null,
      });

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession, user: mockUser },
        error: null,
      });

      const result = await AuthManager.verifySession();

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
    });

    it('should try to restore session if no active session', async () => {
      const mockStoredSession = {
        user: { id: 'user-123' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        expiresAt: Date.now() + 3600000,
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockStoredSession)
      );

      const restoredUser = { id: 'user-123', email: 'restored@example.com' };
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: { user: restoredUser, session: { access_token: 'token-123' } },
        error: null,
      });

      const result = await AuthManager.verifySession();

      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: mockStoredSession.accessToken,
        refresh_token: mockStoredSession.refreshToken,
      });
      expect(result.user).toEqual(restoredUser);
    });
  });

  describe('withVerifiedSession', () => {
    it('should execute operation with verified session', async () => {
      const mockUser = { id: 'user-123' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser, expires_at: new Date(Date.now() + 3600000).toISOString() } },
        error: null,
      });

      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await AuthManager.withVerifiedSession(mockOperation);

      expect(mockOperation).toHaveBeenCalledWith('user-123');
      expect(result).toBe('success');
    });

    it('should throw error if user not authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Not authenticated' },
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const mockOperation = jest.fn();

      await expect(
        AuthManager.withVerifiedSession(mockOperation)
      ).rejects.toThrow('Not authenticated');

      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('should retry on JWT errors with exponential backoff', async () => {
      const mockUser = { id: 'user-123' };

      // First verify call
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: mockUser, expires_at: new Date(Date.now() + 3600000).toISOString() } },
        error: null,
      });

      // Operation fails with JWT error
      const jwtError = new Error('JWT expired');
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(jwtError)
        .mockResolvedValueOnce('success after refresh');

      // Refresh session
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: { session: { user: mockUser }, user: mockUser },
        error: null,
      });

      // Second verify call after refresh
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: mockUser, expires_at: new Date(Date.now() + 3600000).toISOString() } },
        error: null,
      });

      const result = await AuthManager.withVerifiedSession(mockOperation, 3);

      expect(result).toBe('success after refresh');
      expect(mockOperation).toHaveBeenCalledTimes(2);
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
    });

    it('should give up after max retries', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser, expires_at: new Date(Date.now() + 3600000).toISOString() } },
        error: null,
      });

      const jwtError = new Error('JWT token issue');
      const mockOperation = jest.fn().mockRejectedValue(jwtError);

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: { user: mockUser }, user: mockUser },
        error: null,
      });

      await expect(
        AuthManager.withVerifiedSession(mockOperation, 2)
      ).rejects.toThrow('JWT token issue');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });
});
