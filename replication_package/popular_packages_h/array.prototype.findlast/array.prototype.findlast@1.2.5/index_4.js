'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = getPolyfill();
const shim = require('./shim');

const slice = callBound('Array.prototype.slice');

const bindFindLastFunction = callBind.apply(polyfill);

const findLast = function(array, predicate) {
    RequireObjectCoercible(array);
    return bindFindLastFunction(array, slice(arguments, 1));
};

defineProperties(findLast, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = findLast;
