'use strict';

const defineProperties = require('define-properties');
const { apply: callBind, callBound } = require('call-bind');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const arraySlice = callBound('Array.prototype.slice');

const boundFunction = callBind(polyfill);
const findLastIndexPolyfill = function (array, predicate) {
    RequireObjectCoercible(array);
    return boundFunction(array, arraySlice(arguments, 1));
};

defineProperties(findLastIndexPolyfill, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = findLastIndexPolyfill;
