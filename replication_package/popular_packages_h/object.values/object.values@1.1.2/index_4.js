'use strict';

const defineProperties = require('define-properties');
const bindFunction = require('call-bind');

const featureImplementation = require('./implementation');
const fetchPolyfill = require('./polyfill');
const applyShim = require('./shim');

const featurePolyfill = bindFunction(fetchPolyfill(), Object);

defineProperties(featurePolyfill, {
	getPolyfill: fetchPolyfill,
	implementation: featureImplementation,
	shim: applyShim
});

module.exports = featurePolyfill;
