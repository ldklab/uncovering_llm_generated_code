'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundFunction = callBind(implementation);

defineProperties(boundFunction, {
	getPolyfill,
	implementation,
	shim
});

module.exports = boundFunction;
