'use strict';

const defineProperties = require('define-properties');
const callBindHelper = require('es-abstract/helpers/callBind');

const implementationModule = require('./implementation');
const polyfillModule = require('./polyfill');
const shimModule = require('./shim');

const boundedFlags = callBindHelper(implementationModule);

defineProperties(boundedFlags, {
	getPolyfill: polyfillModule,
	implementation: implementationModule,
	shim: shimModule
});

module.exports = boundedFlags;
