'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var polyfillFunction = callBind(getPolyfill(), Object);

defineProperties(polyfillFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = polyfillFunction;
