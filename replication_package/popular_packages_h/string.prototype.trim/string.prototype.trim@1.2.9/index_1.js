'use strict';

const callBind = require('call-bind');
const define = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const boundTrim = callBind(getPolyfill());

const trimMethod = function(receiver) {
    RequireObjectCoercible(receiver);
    return boundTrim(receiver);
};

define(trimMethod, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = trimMethod;
