'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundTrim = callBind(getPolyfill());

function trim(receiver) {
  RequireObjectCoercible(receiver);
  return boundTrim(receiver);
};

defineProperties(trim, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = trim;
