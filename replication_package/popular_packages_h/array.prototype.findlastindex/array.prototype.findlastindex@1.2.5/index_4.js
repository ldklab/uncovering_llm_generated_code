'use strict';

const define = require('define-properties');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const arraySlice = callBound('Array.prototype.slice');

const bound = callBind.apply(polyfill);

const boundFindLast = function findLastIndex(array, predicate) {
    RequireObjectCoercible(array);
    return bound(array, arraySlice(arguments, 1));
};

define(boundFindLast, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = boundFindLast;
