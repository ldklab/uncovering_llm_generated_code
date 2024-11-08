'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

const polyfill = getPolyfill();
const slice = callBound('Array.prototype.slice');

const bound = callBind.apply(polyfill);

const boundFindLast = function(array, predicate) {
    RequireObjectCoercible(array);
    return bound(array, slice(arguments, 1));
};

defineProperties(boundFindLast, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = boundFindLast;
