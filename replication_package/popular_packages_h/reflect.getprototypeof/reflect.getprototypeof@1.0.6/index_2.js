'use strict';

const callBind = require('call-bind');
const define = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill to Reflect if it exists, otherwise to Object
const bound = callBind(
    getPolyfill(),
    typeof Reflect === 'object' ? Reflect : Object
);

// Define additional properties on the bound function
define(bound, {
    getPolyfill,
    implementation,
    shim
});

// Export the bound function with additional properties
module.exports = bound;
