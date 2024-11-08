'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const baseObject = (typeof Reflect === 'object') ? Reflect : Object;
const boundFunction = callBind(getPolyfill(), baseObject);

defineProperties(boundFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundFunction;
