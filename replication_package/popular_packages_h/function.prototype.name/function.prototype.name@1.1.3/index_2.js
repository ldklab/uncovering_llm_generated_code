'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementationFunction = require('./implementation');
const getPolyfillFunction = require('./polyfill');
const shimFunction = require('./shim');

const boundFunction = callBind(implementationFunction);

defineProperties(boundFunction, {
    getPolyfill: getPolyfillFunction,
    implementation: implementationFunction,
    shim: shimFunction
});

module.exports = boundFunction;
