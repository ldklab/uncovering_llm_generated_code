'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfill = callBind(getPolyfill(), Object);

defineProperties(polyfill, {
  getPolyfill,
  implementation,
  shim
});

module.exports = polyfill;
