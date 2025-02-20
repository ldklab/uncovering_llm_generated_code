'use strict';

// Check if WeakMap and WeakSet are supported
const isWeakMapSupported = typeof WeakMap === 'function' && WeakMap.prototype;
const isWeakSetSupported = typeof WeakSet === 'function' && WeakSet.prototype;

let isWeakMap;

// If WeakMap is not supported, provide a fallback function
if (!isWeakMapSupported) {
	isWeakMap = function (x) {
		// Environment does not support WeakMap
		return false;
	};
}

// If a fallback function isn't defined but WeakMap support doesn't have 'has', provide a no-op function
if (!isWeakMap && (!isWeakMapSupported.prototype.has)) {
	isWeakMap = function (x) {
		// Environment's WeakMap does not support 'has' method
		return false;
	};
}

module.exports = isWeakMap || function (x) {
	// If x is not an object, immediately return false
	if (!x || typeof x !== 'object') {
		return false;
	}

	try {
		// Attempt to use prototype 'has' methods to check for WeakMap and WeakSet characteristics
		isWeakMapSupported.prototype.has.call(x, isWeakMapSupported.prototype.has);
		if (isWeakSetSupported) {
			try {
				isWeakSetSupported.prototype.has.call(x, isWeakSetSupported.prototype.has);
			} catch (e) {
				// If WeakSet 'has' throws, x is likely a WeakMap (and not a WeakSet)
				return true;
			}
		}

		// As a last resort, check if x is an instance of WeakMap
		return x instanceof WeakMap;
	} catch (e) {
		// If an error was thrown, x is not likely a WeakMap
		return false;
	}
};
