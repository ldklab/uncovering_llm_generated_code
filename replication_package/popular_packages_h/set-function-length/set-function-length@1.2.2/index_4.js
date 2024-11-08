'use strict';

var GetIntrinsic = require('get-intrinsic');
var define = require('define-data-property');
var hasDescriptors = require('has-property-descriptors')();
var gOPD = require('gopd');

var $TypeError = require('es-errors/type');
var $floor = GetIntrinsic('%Math.floor%');

module.exports = function setFunctionLength(fn, length) {
	// Check if the first argument is a function
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}

	// Check if the length is a valid 32-bit integer
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	// Determine if loose mode is enabled
	var loose = arguments.length > 2 && !!arguments[2];

	// Check if the function's length property can be configured or written to
	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;

	if ('length' in fn && gOPD) {
		var desc = gOPD(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	// Change the length property if it is configurable, writable or not in loose mode
	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(fn, 'length', length, true, true);
		} else {
			define(fn, 'length', length);
		}
	}

	return fn;
};
