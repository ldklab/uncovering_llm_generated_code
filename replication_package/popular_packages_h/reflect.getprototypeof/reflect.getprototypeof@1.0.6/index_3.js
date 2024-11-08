'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const reflectOrObject = typeof Reflect === 'object' ? Reflect : Object;
const polyfillFunction = getPolyfill();
const boundPolyfill = callBind(polyfillFunction, reflectOrObject);

defineProperties(boundPolyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundPolyfill;
