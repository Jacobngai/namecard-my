module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|react-native-safe-area-context|@react-native-async-storage/.*)'
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/*.config.js',
    '!**/coverage/**',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js'
  },
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react'
      }
    }
  }
};