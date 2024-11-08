'use strict';

const env = process.env.NODE_ENV;
const modulePath = env === 'production' 
  ? './index.cjs.production.min.js' 
  : './index.cjs.development.js';

module.exports = require(modulePath);
