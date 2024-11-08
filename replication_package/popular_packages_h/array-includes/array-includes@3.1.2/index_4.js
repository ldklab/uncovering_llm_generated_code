'use strict';

const defineProperties = require('define-properties');
const RequireObjectCoercible = require('es-abstract/2020/RequireObjectCoercible');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = callBind.apply(getPolyfill());
const shim = require('./shim');

const arraySlice = callBound('Array.prototype.slice');

const arrayIncludes = function(array, searchElement) {
  RequireObjectCoercible(array);
  return polyfill(array, arraySlice(arguments, 1));
};

defineProperties(arrayIncludes, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim,
});

module.exports = arrayIncludes;
