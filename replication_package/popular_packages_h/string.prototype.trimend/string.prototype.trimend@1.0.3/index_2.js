'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function
const boundFunction = callBind(getPolyfill());

// Define related properties on the bound function
defineProperties(boundFunction, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = boundFunction;
