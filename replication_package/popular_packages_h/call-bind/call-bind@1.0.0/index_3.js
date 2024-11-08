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
		$defineProperty = null;
	}
}

function callBind() {
	return $reflectApply(bind, $call, arguments);
}

const applyBind = function() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(callBind, 'apply', { value: applyBind });
} else {
	callBind.apply = applyBind;
}

module.exports = callBind;
