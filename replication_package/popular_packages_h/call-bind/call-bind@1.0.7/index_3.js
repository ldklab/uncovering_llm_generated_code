'use strict';

// Import necessary modules and utilities
var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');
var setFunctionLength = require('set-function-length');
var $TypeError = require('es-errors/type');
var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);
var $defineProperty = require('es-define-property');
var $max = GetIntrinsic('%Math.max%');

module.exports = function callBind(originalFunction) {
    // Check if the input is a function, throw an error if not
    if (typeof originalFunction !== 'function') {
        throw new $TypeError('a function is required');
    }
    // Create a bound function using Function.prototype.call
    var func = $reflectApply(bind, $call, arguments);
    // Set the function length with adjustments based on provided arguments
    return setFunctionLength(
        func,
        1 + $max(0, originalFunction.length - (arguments.length - 1)),
        true
    );
};

// Function to create a bound function using Function.prototype.apply
var applyBind = function applyBind() {
    return $reflectApply(bind, $apply, arguments);
};

// Define 'apply' property on exports using defineProperty if available
if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}
