'use strict';

const define = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function
const polyfill = callBind.apply(getPolyfill());

// Create a bound version of Array.prototype.slice
const $slice = callBound('Array.prototype.slice');

// Function that checks if the array includes a search element
const boundShim = function includes(array, searchElement) {
    RequireObjectCoercible(array); // Check if the array is coercible
    return polyfill(array, $slice(arguments, 1)); // Use polyfill with sliced arguments
};

// Define additional properties on the boundShim function
define(boundShim, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

// Export the boundShim function
module.exports = boundShim;
