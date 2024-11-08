'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const reactRouterPath = isProduction 
  ? './umd/react-router.production.min.js' 
  : './umd/react-router.development.js';

module.exports = require(reactRouterPath);
