import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock Alert
global.Alert = {
  alert: jest.fn((title, message, buttons) => {
    if (buttons && buttons.length > 0) {
      const firstButton = buttons[0];
      if (firstButton.onPress) {
        firstButton.onPress();
      }
    }
  }),
};

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('React Native Testing Library')
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('Not implemented')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});