'use strict';

const env = process.env.NODE_ENV;
const isProduction = env === 'production';

module.exports = isProduction 
  ? require('./cjs/react.production.min.js') 
  : require('./cjs/react.development.js');
