'use strict';

const schedulerModule = process.env.NODE_ENV === 'production' 
  ? './cjs/scheduler.production.min.js' 
  : './cjs/scheduler.development.js';

module.exports = require(schedulerModule);
