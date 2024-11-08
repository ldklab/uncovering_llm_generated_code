'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill for Object.assign to the assign function
const polyfill = callBind.apply(getPolyfill());

const assign = function(target, ...sources) {
  return polyfill(Object, [target, ...sources]);
};

// Define additional properties on the assign function
defineProperties(assign, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the assign function
module.exports = assign;
