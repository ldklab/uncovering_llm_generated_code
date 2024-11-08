'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const path = isProduction 
  ? './react-redux.production.min.cjs' 
  : './react-redux.development.cjs';

module.exports = require(path);
