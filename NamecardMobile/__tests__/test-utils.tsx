import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Create a custom render function that includes providers
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Mock data generators
export const mockContact = (overrides = {}) => ({
  id: 'contact_1',
  name: 'John Doe',
  company: 'Tech Corp',
  email: 'john@techcorp.com',
  phone: '+1234567890',
  address: '123 Tech Street',
  notes: 'Met at conference',
  imageUri: 'file:///test/image.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isLocal: false,
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 'user_1',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
  ...overrides,
});

export const mockSession = (overrides = {}) => ({
  access_token: 'test_token',
  refresh_token: 'test_refresh',
  user: mockUser(),
  ...overrides,
});

// Async utilities
export const waitForAsync = (ms: number = 0) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Navigation test helpers
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
});

export const createMockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

// Form test helpers
export const fillForm = async (
  { getByPlaceholderText, getByTestId }: any,
  fields: Record<string, string>
) => {
  for (const [placeholder, value] of Object.entries(fields)) {
    const input = getByPlaceholderText(placeholder) || getByTestId(placeholder);
    await input.props.onChangeText(value);
  }
};

// Permission test helpers
export const mockPermissions = {
  camera: {
    granted: { status: 'granted' },
    denied: { status: 'denied' },
    undetermined: { status: 'undetermined' },
  },
  mediaLibrary: {
    granted: { status: 'granted', accessPrivileges: 'all' },
    denied: { status: 'denied', accessPrivileges: 'none' },
    limited: { status: 'granted', accessPrivileges: 'limited' },
  },
};

// API mock helpers
export const mockApiResponse = (data: any, error: any = null) => ({
  data,
  error,
  count: data?.length || 0,
});

export const mockSupabaseQuery = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
});

// Export everything
export * from '@testing-library/react-native';
export { render };