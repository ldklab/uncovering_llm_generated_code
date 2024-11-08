'use strict';

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const modulePath = isProduction 
  ? './umd/react-router-dom.production.min.js' 
  : './umd/react-router-dom.development.js';

module.exports = require(modulePath);
