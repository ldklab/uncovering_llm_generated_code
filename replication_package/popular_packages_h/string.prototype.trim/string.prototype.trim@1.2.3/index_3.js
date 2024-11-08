'use strict';

const callBind = require('call-bind');
const define = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundTrim = callBind(getPolyfill());

define(boundTrim, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundTrim;
