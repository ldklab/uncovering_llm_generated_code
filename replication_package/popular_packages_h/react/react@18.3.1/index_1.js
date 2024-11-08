'use strict';

// Determine which version of React to export based on the environment
const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

// Export the appropriate version of React
module.exports = isProduction 
  ? require('./cjs/react.production.min.js') 
  : require('./cjs/react.development.js');
