'use strict';

var defineProperties = require('define-properties');
var requireCoercible = require('es-abstract/2020/RequireObjectCoercible');
var bindFunction = require('call-bind');
var boundedCall = require('call-bind/callBound');

var actualImplementation = require('./implementation');
var retrievePolyfill = require('./polyfill');
var boundPolyfill = bindFunction.apply(retrievePolyfill());
var applyShim = require('./shim');

var arraySlice = boundedCall('Array.prototype.slice');

var includesFunction = function includes(arr, element) {
    requireCoercible(arr);
    return boundPolyfill(arr, arraySlice(arguments, 1));
};

defineProperties(includesFunction, {
    getPolyfill: retrievePolyfill,
    implementation: actualImplementation,
    shim: applyShim
});

module.exports = includesFunction;
