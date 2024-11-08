'use strict';

const Sharp = require('./constructor');

// Import and attach various processing capabilities to the Sharp instance
[
  './input',
  './resize',
  './composite',
  './operation',
  './colour',
  './channel',
  './output',
  './utility'
].forEach(modulePath => require(modulePath)(Sharp));

// Export the enhanced Sharp instance
module.exports = Sharp;
