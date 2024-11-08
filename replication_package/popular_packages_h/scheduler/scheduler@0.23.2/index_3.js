'use strict';

const isProduction = process.env.NODE_ENV === 'production';

const schedulerPath = isProduction 
  ? './cjs/scheduler.production.min.js' 
  : './cjs/scheduler.development.js';

module.exports = require(schedulerPath);
