'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundFunction = callBind(getPolyfill());

defineProperties(boundFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundFunction;
