'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const boundFlatMap = callBind(polyfill);

defineProperties(boundFlatMap, {
  getPolyfill,
  implementation,
  shim
});

module.exports = boundFlatMap;
