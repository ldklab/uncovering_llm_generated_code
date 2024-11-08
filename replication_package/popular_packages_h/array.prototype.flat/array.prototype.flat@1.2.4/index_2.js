'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const boundFlat = callBind(polyfill);

defineProperties(boundFlat, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundFlat;
