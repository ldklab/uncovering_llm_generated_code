'use strict';

var callBind = require('call-bind');
var defineProperties = require('define-properties');
var RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Bind the polyfilled trim method to ensure proper usage.
var boundTrim = callBind(getPolyfill());

// Define the main method that checks for valid receiver and calls the bound trim.
var trimMethod = function(receiver) {
    // Ensure the receiver is an object and not undefined or null.
    RequireObjectCoercible(receiver);
    // Call the bound trim method with the receiver.
    return boundTrim(receiver);
};

// Define additional properties on the trimMethod function.
defineProperties(trimMethod, {
    getPolyfill: getPolyfill, // Method to get the polyfill function.
    implementation: implementation, // Actual implementation of the trim method.
    shim: shim // Function to shim the trim method onto String.prototype if needed.
});

// Export the main trimMethod function.
module.exports = trimMethod;
