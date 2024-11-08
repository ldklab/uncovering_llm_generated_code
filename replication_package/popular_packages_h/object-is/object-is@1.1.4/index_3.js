'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const createPolyfill = callBind(getPolyfill(), Object);

defineProperties(createPolyfill, {
	getPolyfill,
	implementation,
	shim
});

module.exports = createPolyfill;
