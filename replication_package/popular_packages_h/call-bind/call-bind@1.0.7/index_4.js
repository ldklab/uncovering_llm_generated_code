'use strict';

// Import required modules
var bind = require('function-bind'); // For binding functions
var GetIntrinsic = require('get-intrinsic'); // For accessing intrinsic JavaScript functions
var setFunctionLength = require('set-function-length'); // To set the function length explicitly

// Import specific intrinsic objects
var $TypeError = require('es-errors/type'); // Custom TypeError
var $apply = GetIntrinsic('%Function.prototype.apply%'); // Reflects native Function.prototype.apply
var $call = GetIntrinsic('%Function.prototype.call%'); // Reflects native Function.prototype.call
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply); // Reflect.apply or uses fallback

var $defineProperty = require('es-define-property'); // Define property method
var $max = GetIntrinsic('%Math.max%'); // Math.max intrinsic

// Main export function callBind
module.exports = function callBind(originalFunction) {
	if (typeof originalFunction !== 'function') {
		throw new $TypeError('a function is required'); // Ensure originalFunction is a function
	}
	var func = $reflectApply(bind, $call, arguments); // Bind the function call
	return setFunctionLength(
		func,
		1 + $max(0, originalFunction.length - (arguments.length - 1)), // Set the correct function length
		true
	);
};

// Auxiliary function to handle apply-scenario
var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

// Add 'apply' method to module's exports
if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}
