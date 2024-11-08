'use strict';

// Required modules for functionality and properties definition
const callBind = require('call-bind');
const define = require('define-properties');

// Required custom modules providing implementation, polyfills, and shims
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function to the current context
const boundFunction = callBind(getPolyfill());

// Define additional properties on the bound function
define(boundFunction, {
    getPolyfill: getPolyfill,  // Reference to the polyfill function
    implementation: implementation,  // Reference to the implementation module
    shim: shim  // Reference to the shim module
});

// Export the bound function which now carries additional methods/properties
module.exports = boundFunction;
