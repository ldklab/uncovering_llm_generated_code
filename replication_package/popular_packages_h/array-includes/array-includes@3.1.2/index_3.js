'use strict';

const define = require('define-properties');
const RequireObjectCoercible = require('es-abstract/2020/RequireObjectCoercible');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const polyfill = callBind.apply(getPolyfill());
const shim = require('./shim');

const $slice = callBound('Array.prototype.slice');

function includes(array, searchElement) {
	RequireObjectCoercible(array);
	return polyfill(array, $slice(arguments, 1));
}

define(includes, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = includes;
