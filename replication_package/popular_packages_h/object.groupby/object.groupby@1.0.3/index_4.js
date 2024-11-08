'use strict';

const defineProperties = require('define-properties');
const bindFunction = require('call-bind');

const implementation = require('./implementation');
const polyfillFactory = require('./polyfill');
const polyfill = polyfillFactory();
const shim = require('./shim');

const boundFunction = bindFunction(polyfill, Object);

defineProperties(boundFunction, {
  getPolyfill: polyfillFactory,
  implementation: implementation,
  shim: shim
});

module.exports = boundFunction;
