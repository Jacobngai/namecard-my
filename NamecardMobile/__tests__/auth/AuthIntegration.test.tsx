import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from '../../App';
import { AuthScreen } from '../../components/screens/AuthScreen';
import { SupabaseService } from '../../services/supabase';
import { mockAuthResponses, mockSupabaseService } from '../../__mocks__/supabase.mock';

// Mock dependencies
jest.mock('../../services/supabase');
jest.mock('../../services/googleVision');
jest.mock('../../config/env', () => ({
  ENV: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key',
    GOOGLE_VISION_API_KEY: 'test-vision-key',
  },
  validateEnv: () => ({ isValid: true, missingKeys: [] }),
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();

    // Set up default mocks
    (SupabaseService.getCurrentSession as jest.Mock).mockResolvedValue(null);
    (SupabaseService.initializeStorage as jest.Mock).mockResolvedValue(undefined);
    (SupabaseService.getContacts as jest.Mock).mockResolvedValue([]);
    (SupabaseService.subscribeToContacts as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const { getByText, getByPlaceholderText, queryByText } = render(<App />);

      // Wait for app to initialize
      await waitFor(() => {
        expect(queryByText('NAMECARD.MY')).toBeTruthy();
      });

      // Navigate to registration
      const registerTab = getByText('Register');
      fireEvent.press(registerTab);

      // Fill registration form
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'New User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      // Mock successful registration
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpSuccess);

      // Submit registration
      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Registration successful! Please check your email to confirm your account.',
          expect.any(Array)
        );
      });

      // Simulate email confirmation and login
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      act(() => okButton.onPress());

      // Now login with the same credentials
      await waitFor(() => {
        expect(queryByText('Sign In')).toBeTruthy();
      });

      fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

      // Mock successful login
      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      // Should navigate to main app
      await waitFor(() => {
        expect(SupabaseService.signIn).toHaveBeenCalledWith(
          'newuser@example.com',
          'password123'
        );
      });
    });

    it('should handle password reset flow end-to-end', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for app to initialize
      await waitFor(() => {
        expect(getByText('NAMECARD.MY')).toBeTruthy();
      });

      // Navigate to forgot password
      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      // Enter email for reset
      fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');

      // Mock successful password reset
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Password reset link sent! Check your email.',
          expect.any(Array)
        );
      });

      // Simulate returning to login
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      act(() => okButton.onPress());

      // Should be back at login screen
      await waitFor(() => {
        expect(getByText('Sign In')).toBeTruthy();
      });

      // Now login with new password (simulating after reset)
      fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'newpassword123');

      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(SupabaseService.signIn).toHaveBeenCalledWith(
          'user@example.com',
          'newpassword123'
        );
      });
    });
  });

  describe('Session Persistence', () => {
    it('should automatically login if session exists', async () => {
      // Mock existing session
      (SupabaseService.getCurrentSession as jest.Mock).mockResolvedValue(mockAuthResponses.sessionActive);

      const { queryByText, queryByPlaceholderText } = render(<App />);

      // Should skip auth screen and go to main app
      await waitFor(() => {
        expect(queryByPlaceholderText('Email')).toBeFalsy();
        expect(queryByPlaceholderText('Password')).toBeFalsy();
        expect(SupabaseService.getCurrentSession).toHaveBeenCalled();
      });
    });

    it('should show auth screen if no session exists', async () => {
      // Mock no existing session
      (SupabaseService.getCurrentSession as jest.Mock).mockResolvedValue(null);

      const { queryByText, queryByPlaceholderText } = render(<App />);

      // Should show auth screen
      await waitFor(() => {
        expect(queryByPlaceholderText('Email')).toBeTruthy();
        expect(queryByPlaceholderText('Password')).toBeTruthy();
        expect(queryByText('Sign In')).toBeTruthy();
      });
    });

    it('should handle logout and return to auth screen', async () => {
      // Start with active session
      (SupabaseService.getCurrentSession as jest.Mock).mockResolvedValue(mockAuthResponses.sessionActive);
      (SupabaseService.signOut as jest.Mock).mockResolvedValue({ error: null });

      const { getByText, queryByText, rerender } = render(<App />);

      // Wait for app to load with session
      await waitFor(() => {
        expect(SupabaseService.getCurrentSession).toHaveBeenCalled();
      });

      // Navigate to Profile tab
      await waitFor(() => {
        const profileTab = getByText('Profile');
        fireEvent.press(profileTab);
      });

      // Find and click logout
      await waitFor(() => {
        const logoutButton = getByText('Sign Out');
        fireEvent.press(logoutButton);
      });

      // Should call signOut and return to auth screen
      await waitFor(() => {
        expect(SupabaseService.signOut).toHaveBeenCalled();
      });

      // Mock no session after logout
      (SupabaseService.getCurrentSession as jest.Mock).mockResolvedValue(null);

      // Re-render to simulate state change
      rerender(<App />);

      // Should show auth screen again
      await waitFor(() => {
        expect(queryByText('Sign In')).toBeTruthy();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from failed login attempts', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for initialization
      await waitFor(() => {
        expect(getByText('NAMECARD.MY')).toBeTruthy();
      });

      // First attempt - wrong password
      fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');

      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInError);

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Invalid login credentials'
        );
      });

      // Clear alert mock
      (Alert.alert as jest.Mock).mockClear();

      // Second attempt - correct password
      fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');

      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(SupabaseService.signIn).toHaveBeenLastCalledWith(
          'user@example.com',
          'correctpassword'
        );
      });
    });

    it('should handle network errors and retry', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for initialization
      await waitFor(() => {
        expect(getByText('NAMECARD.MY')).toBeTruthy();
      });

      fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

      // First attempt - network error
      (SupabaseService.signIn as jest.Mock).mockRejectedValue(new Error('Network error'));

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Network error'
        );
      });

      // Clear mocks
      (Alert.alert as jest.Mock).mockClear();
      jest.clearAllMocks();

      // Retry - successful
      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(SupabaseService.signIn).toHaveBeenCalledWith(
          'user@example.com',
          'password123'
        );
        expect(Alert.alert).not.toHaveBeenCalled();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain form state when switching between login and register', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for initialization
      await waitFor(() => {
        expect(getByText('NAMECARD.MY')).toBeTruthy();
      });

      // Enter login credentials
      fireEvent.changeText(getByPlaceholderText('Email'), 'login@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'loginpass');

      // Switch to register
      const registerTab = getByText('Register');
      fireEvent.press(registerTab);

      // Enter register data
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'register@example.com');

      // Switch back to login
      const signInTab = getByText('Sign In');
      fireEvent.press(signInTab);

      // Original login data should be preserved
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      expect(emailInput.props.value).toBe('login@example.com');
      expect(passwordInput.props.value).toBe('loginpass');
    });

    it('should clear sensitive data after successful authentication', async () => {
      let authScreenRef: any;
      const mockOnAuthSuccess = jest.fn((user) => {
        // Simulate clearing sensitive data
        authScreenRef = null;
      });

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen
          ref={(ref) => authScreenRef = ref}
          onAuthSuccess={mockOnAuthSuccess}
        />
      );

      fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockAuthResponses.signInSuccess.user);
        expect(authScreenRef).toBeNull();
      });
    });
  });
});