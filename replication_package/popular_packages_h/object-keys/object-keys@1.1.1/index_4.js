'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var origKeys = Object.keys;

/**
 * A shim for Object.keys that checks if it works with arguments objects.
 * If it does not, patches Object.keys with a custom implementation.
 */
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : require('./implementation');

var originalKeys = Object.keys;

/**
 * This shim method checks if the Object.keys evaluation works with arguments.
 * If not, it replaces Object.keys with a custom shim that handles arguments objects correctly.
 */
keysShim.shim = function shimObjectKeys() {
	if (origKeys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug workaround: check if Object.keys works with the arguments object
			var args = origKeys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;
