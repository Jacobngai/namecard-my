export const theme = {
  colors: {
    // Brand Colors (WhatsApp green theme)
    primary: '#4A7A5C',
    primaryLight: '#5C8A6E',
    primaryDark: '#2D5A40',

    // Accent Colors
    accent: '#25D366',        // WhatsApp official green
    accentLight: '#34E676',
    accentDark: '#1EAD52',

    // Functional Colors
    success: '#25D366',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#2563EB',

    // Neutrals
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Semantic Colors
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#E5E7EB',

    // Status Colors
    online: '#25D366',
    offline: '#9CA3AF',
    busy: '#EF4444',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  typography: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 16,
    },
  },

  // Minimum touch target size (44x44 per Apple HIG, 48x48 per Material Design)
  minTouchTarget: 44,
};

export type Theme = typeof theme;
