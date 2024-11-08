'use strict';

var defineProperties = require('define-properties');
var bind = require('call-bind');

var implementationModule = require('./implementation');
var polyfillFunction = require('./polyfill');
var shimFunction = require('./shim');

var boundPolyfill = bind(polyfillFunction(), Object);

defineProperties(boundPolyfill, {
	getPolyfill: polyfillFunction,
	implementation: implementationModule,
	shim: shimFunction
});

module.exports = boundPolyfill;
