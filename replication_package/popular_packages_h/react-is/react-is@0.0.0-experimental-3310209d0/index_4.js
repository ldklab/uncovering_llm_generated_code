'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const filePath = isProduction 
  ? './cjs/react-is.production.min.js' 
  : './cjs/react-is.development.js';

module.exports = require(filePath);
