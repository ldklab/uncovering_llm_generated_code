'use strict';

const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfillFunction = getPolyfill();
const boundFlatMap = callBind(polyfillFunction);

define(boundFlatMap, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundFlatMap;
