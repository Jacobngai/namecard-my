export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
    listBuckets: jest.fn(),
    createBucket: jest.fn(),
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
};

export const createClient = jest.fn(() => mockSupabaseClient);

// Mock Supabase Service
export const mockSupabaseService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  getCurrentSession: jest.fn(),
  getCurrentUser: jest.fn(),
  getClient: jest.fn(() => mockSupabaseClient),
  createContact: jest.fn(),
  getContacts: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
  initializeStorage: jest.fn(),
  subscribeToContacts: jest.fn(() => ({
    unsubscribe: jest.fn(),
  })),
};

// Mock successful responses
export const mockAuthResponses = {
  signUpSuccess: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    },
    error: null,
  },
  signUpError: {
    user: null,
    error: { message: 'User already registered' },
  },
  signInSuccess: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    },
    error: null,
  },
  signInError: {
    user: null,
    error: { message: 'Invalid login credentials' },
  },
  resetPasswordSuccess: {
    error: null,
  },
  resetPasswordError: {
    error: { message: 'User not found' },
  },
  sessionActive: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    },
  },
  sessionInactive: null,
};