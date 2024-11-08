'use strict';

const isBrowserEnvironment = typeof window !== 'undefined' && typeof MessageChannel === 'function';

if (!isBrowserEnvironment) {
  module.exports = require('./unstable_no_dom');
} else {
  const isProduction = process.env.NODE_ENV === 'production';
  const modulePath = isProduction 
    ? './cjs/scheduler.production.min.js' 
    : './cjs/scheduler.development.js';
  
  module.exports = require(modulePath);
}
