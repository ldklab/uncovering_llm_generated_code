'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const flagsBound = callBind(getPolyfill());

defineProperties(flagsBound, {
  getPolyfill,
  implementation,
  shim
});

module.exports = flagsBound;
