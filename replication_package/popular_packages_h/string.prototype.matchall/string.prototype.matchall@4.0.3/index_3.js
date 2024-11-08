'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const matchAllImplementation = require('./implementation');
const getPolyfillFunction = require('./polyfill');
const shimFunction = require('./shim');

const boundMatchAllFunction = callBind(matchAllImplementation);

defineProperties(boundMatchAllFunction, {
    getPolyfill: getPolyfillFunction,
    implementation: matchAllImplementation,
    shim: shimFunction
});

module.exports = boundMatchAllFunction;
