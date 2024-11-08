'use strict';

const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const bound = callBind(polyfill, Object);

define(bound, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = bound;
