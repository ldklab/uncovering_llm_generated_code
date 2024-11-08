'use strict';

const callBind = require('call-bind');
const define = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the implementation function for ease of use.
const boundMatchAll = callBind(implementation);

// Attach additional utility properties for extending functionality.
define(boundMatchAll, {
  getPolyfill,
  implementation,
  shim
});

// Export the combined functionality as the module export.
module.exports = boundMatchAll;
