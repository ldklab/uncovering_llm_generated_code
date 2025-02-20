'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfill = getPolyfill();
const $slice = callBound('Array.prototype.slice');

// Create a bound version of the polyfill function
const boundPolyfill = callBind.apply(polyfill);

// Define the main function "boundFindLast"
const boundFindLast = function findLastIndex(array, predicate) {
    // Ensure that the "array" is not null or undefined
    RequireObjectCoercible(array);
    // Apply the bound version of the polyfill on the array with the rest of the arguments
    return boundPolyfill(array, $slice(arguments, 1));
};

// Define properties and methods on "boundFindLast"
defineProperties(boundFindLast, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

// Export the "boundFindLast" function
module.exports = boundFindLast;
