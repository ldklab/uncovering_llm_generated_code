'use strict';

const path = process.env.NODE_ENV === 'production' 
  ? './react-redux.production.min.cjs' 
  : './react-redux.development.cjs';

module.exports = require(path);
