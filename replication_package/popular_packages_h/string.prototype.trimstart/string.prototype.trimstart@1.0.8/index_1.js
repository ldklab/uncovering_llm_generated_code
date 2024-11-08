'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const bound = callBind(getPolyfill());

function trimMethod(receiver) {
    RequireObjectCoercible(receiver);
    return bound(receiver);
}

defineProperties(trimMethod, {
    getPolyfill,
    implementation,
    shim
});

module.exports = trimMethod;
