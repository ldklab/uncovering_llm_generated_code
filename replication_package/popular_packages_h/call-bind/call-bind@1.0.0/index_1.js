'use strict';

const bind = require('function-bind');
const GetIntrinsic = require('get-intrinsic');

const $apply = GetIntrinsic('%Function.prototype.apply%');
const $call = GetIntrinsic('%Function.prototype.call%');
const $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

let $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		$defineProperty = null; // Fallback for environments with faulty defineProperty, like IE 8
	}
}

const callBind = function() {
	return $reflectApply(bind, $call, arguments);
};

const applyBind = function() {
	return $reflectApply(bind, $apply, arguments);
};

module.exports = callBind;

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}
