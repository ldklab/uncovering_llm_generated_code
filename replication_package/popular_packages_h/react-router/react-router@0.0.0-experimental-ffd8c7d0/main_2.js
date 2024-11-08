'use strict';

// Export the appropriate module based on the NODE_ENV environment variable
module.exports = process.env.NODE_ENV === 'production'
  ? require('./umd/react-router.production.min.js') // Production build
  : require('./umd/react-router.development.js');   // Development build
