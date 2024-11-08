'use strict';

const defineProperties = require('define-properties');
const callBind = require('es-abstract/helpers/callBind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the implementation to create a function with a specific context
const boundFlagsFunction = callBind(implementation);

// Define additional properties on the bound function
defineProperties(boundFlagsFunction, {
    getPolyfill,
    implementation,
    shim
});

// Export the bound function with additional properties
module.exports = boundFlagsFunction;
