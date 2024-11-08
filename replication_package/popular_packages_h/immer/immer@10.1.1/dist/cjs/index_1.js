'use strict';

const environment = process.env.NODE_ENV;
const modulePath = environment === 'production' 
  ? './immer.cjs.production.js' 
  : './immer.cjs.development.js';

module.exports = require(modulePath);
