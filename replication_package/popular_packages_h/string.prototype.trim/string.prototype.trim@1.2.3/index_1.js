'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Get the appropriate polyfill and bind it.
const boundTrim = callBind(getPolyfill());

// Define additional properties related to string trimming polyfill on boundTrim.
defineProperties(boundTrim, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the bound and augmented trim function as a module.
module.exports = boundTrim;
