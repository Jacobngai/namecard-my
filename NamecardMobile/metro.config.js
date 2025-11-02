const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Performance optimizations for hot reloading
config.resolver = {
  ...config.resolver,
  // Speed up resolution by caching
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Improve module resolution speed
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

// Optimize transformer for faster rebuilds
config.transformer = {
  ...config.transformer,
  // Enable fast refresh
  experimentalImportSupport: false,
  inlineRequires: true,
  // Minification options for development
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    // Faster builds in development
    keep_fnames: true,
    keep_classnames: true,
  },
};

// Caching configuration for faster rebuilds
config.cacheVersion = '1.0';
config.resetCache = false;

// Watch options for better performance
config.watchFolders = [];
config.maxWorkers = 4; // Adjust based on your CPU cores

// Server configuration
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add cache headers for static assets
      if (req.url.includes('.bundle')) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;