'use strict';

const callBind = require('call-bind');
const define = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const bound = callBind(getPolyfill());
const boundMethod = function trim(receiver) {
    RequireObjectCoercible(receiver);
    return bound(receiver);
};

define(boundMethod, {
    getPolyfill,
    implementation,
    shim
});

module.exports = boundMethod;
