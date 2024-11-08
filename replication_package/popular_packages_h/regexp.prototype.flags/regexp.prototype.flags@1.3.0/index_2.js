'use strict';

const defineProperties = require('define-properties');
const bindFunction = require('es-abstract/helpers/callBind');

const coreImplementation = require('./implementation');
const fetchPolyfill = require('./polyfill');
const applyShim = require('./shim');

const boundFunction = bindFunction(coreImplementation);

defineProperties(boundFunction, {
	getPolyfill: fetchPolyfill,
	implementation: coreImplementation,
	shim: applyShim
});

module.exports = boundFunction;
