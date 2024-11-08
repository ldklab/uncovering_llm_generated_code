'use strict';

const isBrowser = (typeof window !== 'undefined' && typeof MessageChannel === 'function');
const isProduction = (process.env.NODE_ENV === 'production');

if (!isBrowser) {
  // If not a browser-like environment, export no DOM functionality.
  module.exports = require('./unstable_no_dom');
} else if (isProduction) {
  // If in a production environment within a browser, export production scheduler.
  module.exports = require('./cjs/scheduler.production.min.js');
} else {
  // Otherwise, export the development version of the scheduler for non-production browser environments.
  module.exports = require('./cjs/scheduler.development.js');
}
