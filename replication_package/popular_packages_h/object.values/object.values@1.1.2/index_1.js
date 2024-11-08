'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Invoke getPolyfill and bind the result to Object with callBind
var polyfill = callBind(getPolyfill(), Object);

// Define properties on the polyfill object
defineProperties(polyfill, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

// Export the polyfill
module.exports = polyfill;
