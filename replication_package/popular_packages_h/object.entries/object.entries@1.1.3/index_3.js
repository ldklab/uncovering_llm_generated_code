'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfillFunction = callBind(getPolyfill(), Object);

defineProperties(polyfillFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = polyfillFunction;
