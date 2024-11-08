'use strict';

const defineProperties = require('define-properties');
const bindFunction = require('call-bind');

const implementationFunction = require('./implementation');
const fetchPolyfill = require('./polyfill');
const applyShim = require('./shim');

const polyfillFunction = bindFunction(fetchPolyfill(), Object);

defineProperties(polyfillFunction, {
    getPolyfill: fetchPolyfill,
    implementation: implementationFunction,
    shim: applyShim
});

module.exports = polyfillFunction;
