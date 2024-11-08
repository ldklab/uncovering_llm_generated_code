'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfill = getPolyfill();
const boundFlatMap = callBind(polyfill);

defineProperties(boundFlatMap, {
	getPolyfill,
	implementation,
	shim
});

module.exports = boundFlatMap;
