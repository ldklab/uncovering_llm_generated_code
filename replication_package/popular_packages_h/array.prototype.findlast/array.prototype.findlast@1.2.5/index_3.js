'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

// Importing local modules
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

// Binding utilities
const slice = callBound('Array.prototype.slice');
const bound = callBind.apply(polyfill);

// Define the boundFindLast function
const boundFindLast = function findLast(array, predicate) {
    RequireObjectCoercible(array); // Ensure array is not null or undefined
    return bound(array, slice(arguments, 1)); // Call bound function with array and additional args
};

// Define properties on boundFindLast
defineProperties(boundFindLast, {
    getPolyfill,
    implementation,
    shim
});

// Export the function
module.exports = boundFindLast;
