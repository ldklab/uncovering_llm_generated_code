'use strict';

const defineProperties = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const appliedPolyfill = callBind.apply(getPolyfill());
const arraySlice = callBound('Array.prototype.slice');

const includesPolyfill = function(array, searchElement) {
    RequireObjectCoercible(array);
    return appliedPolyfill(array, arraySlice(arguments, 1));
};

defineProperties(includesPolyfill, {
    getPolyfill,
    implementation,
    shim
});

module.exports = includesPolyfill;
