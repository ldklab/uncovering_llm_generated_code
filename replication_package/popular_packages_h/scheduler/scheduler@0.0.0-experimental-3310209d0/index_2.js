'use strict';

const isNodeEnvironment = typeof window === 'undefined' || typeof MessageChannel !== 'function';

if (isNodeEnvironment) {
  module.exports = require('./unstable_no_dom');
} else {
  const isProduction = process.env.NODE_ENV === 'production';
  module.exports = isProduction
    ? require('./cjs/scheduler.production.min.js')
    : require('./cjs/scheduler.development.js');
}
