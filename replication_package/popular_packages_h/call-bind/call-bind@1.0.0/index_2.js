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
		$defineProperty = null; // Fallback for environments where defineProperty is broken
	}
}

function callBind() {
	return $reflectApply(bind, $call, arguments);
}

function applyBind() {
	return $reflectApply(bind, $apply, arguments);
}

const moduleExports = {
	callBind,
	apply: applyBind
};

if ($defineProperty) {
	$defineProperty(moduleExports, 'apply', { value: applyBind });
} else {
	moduleExports.apply = applyBind;
}

module.exports = moduleExports;
