'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const modulePath = isProduction 
  ? './cjs/react-is.production.min.js' 
  : './cjs/react-is.development.js';

module.exports = require(modulePath);
