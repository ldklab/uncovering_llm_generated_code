'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementationFunction = require('./implementation');
const getPolyfillFunction = require('./polyfill');
const shimFunction = require('./shim');

const polyfillFunction = callBind(getPolyfillFunction(), Object);

defineProperties(polyfillFunction, {
	getPolyfill: getPolyfillFunction,
	implementation: implementationFunction,
	shim: shimFunction
});

module.exports = polyfillFunction;
