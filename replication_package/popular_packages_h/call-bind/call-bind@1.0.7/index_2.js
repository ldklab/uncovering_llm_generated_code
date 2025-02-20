'use strict';

const bind = require('function-bind');
const GetIntrinsic = require('get-intrinsic');
const setFunctionLength = require('set-function-length');

const $TypeError = require('es-errors/type');
const $apply = GetIntrinsic('%Function.prototype.apply%');
const $call = GetIntrinsic('%Function.prototype.call%');
const $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

const $defineProperty = require('es-define-property');
const $max = GetIntrinsic('%Math.max%');

function callBind(originalFunction) {
	if (typeof originalFunction !== 'function') {
		throw new $TypeError('a function is required');
	}
	const func = $reflectApply(bind, $call, arguments);
	return setFunctionLength(
		func,
		1 + $max(0, originalFunction.length - (arguments.length - 1)),
		true
	);
}

function applyBind() {
	return $reflectApply(bind, $apply, arguments);
}

if ($defineProperty) {
	$defineProperty(callBind, 'apply', { value: applyBind });
} else {
	callBind.apply = applyBind;
}

module.exports = callBind;
