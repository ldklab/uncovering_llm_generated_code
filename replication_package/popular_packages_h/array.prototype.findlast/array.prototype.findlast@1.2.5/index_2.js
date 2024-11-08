'use strict';

var define = require('define-properties');
var callBind = require('call-bind');
var callBound = require('call-bind/callBound');
var RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var polyfill = getPolyfill();
var shim = require('./shim');

var slice = callBound('Array.prototype.slice');

var boundFunction = callBind.apply(polyfill);

var boundFindLast = function(array, predicate) {
    RequireObjectCoercible(array);
    return boundFunction(array, slice(arguments, 1));
};

define(boundFindLast, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
});

module.exports = boundFindLast;
