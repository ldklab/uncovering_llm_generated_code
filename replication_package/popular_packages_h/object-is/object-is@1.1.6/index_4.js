'use strict';

const defineProperties = require('define-properties');
const callBindMethod = require('call-bind');

const implementationModule = require('./implementation');
const getPolyfillFunction = require('./polyfill');
const shimFunction = require('./shim');

const boundPolyfill = callBindMethod(getPolyfillFunction(), Object);

defineProperties(boundPolyfill, {
	getPolyfill: getPolyfillFunction,
	implementation: implementationModule,
	shim: shimFunction
});

module.exports = boundPolyfill;
