'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const polyfill = require('./polyfill');
const shim = require('./shim');

const boundPolyfill = callBind(polyfill());

defineProperties(boundPolyfill, {
  getPolyfill: polyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundPolyfill;
