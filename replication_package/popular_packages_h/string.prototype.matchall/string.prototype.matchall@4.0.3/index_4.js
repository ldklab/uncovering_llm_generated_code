'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundMatchAll = callBind(implementation);

defineProperties(boundMatchAll, {
  getPolyfill,
  implementation,
  shim,
});

module.exports = boundMatchAll;
