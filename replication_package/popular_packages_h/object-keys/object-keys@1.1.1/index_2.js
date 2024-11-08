'use strict';

const slice = Array.prototype.slice;
const isArgs = require('./isArguments');
const origKeys = Object.keys;
const keysShim = origKeys ? (obj) => origKeys(obj) : require('./implementation');

const originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		const keysWorksWithArguments = (() => {
			// Safari 5.0 bug check
			const args = Object.keys(arguments);
			return args && args.length === arguments.length;
		})(1, 2);

		if (!keysWorksWithArguments) {
			Object.keys = function enhancedKeys(object) {
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
