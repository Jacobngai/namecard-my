module.exports = {
  root: true,
  extends: [
    '@react-native/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-native/no-inline-styles': 'warn',
  },
  ignorePatterns: ['node_modules/', 'build/', 'dist/', '.expo/'],
};
