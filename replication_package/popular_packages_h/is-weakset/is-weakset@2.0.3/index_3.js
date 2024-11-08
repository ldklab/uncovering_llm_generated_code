'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');

// Retrieve the intrinsic WeakSet constructor if available
var $WeakSet = GetIntrinsic('%WeakSet%', true);

// Get the bound `has` method from WeakSet.prototype, if it exists
var $setHas = callBound('WeakSet.prototype.has', true);

// Export the isWeakSet function based on feature detection
if ($setHas) {
	// Get the bound `has` method from WeakMap.prototype, if it exists
	var $mapHas = callBound('WeakMap.prototype.has', true);

	/** @type {import('.')} */
	module.exports = function isWeakSet(x) {
		// Check if x is a non-null object
		if (!x || typeof x !== 'object') {
			return false;
		}
		try {
			// Test if the object `x` can be passed to WeakSet's `has` method.
			$setHas(x, $setHas);
			// Further check using WeakMap's `has` if available
			if ($mapHas) {
				try {
					$mapHas(x, $mapHas);
				} catch (e) {
					// If it throws, x is likely a WeakSet
					return true;
				}
			}
			// Verify instance of WeakSet if intrinsic is present
			return x instanceof $WeakSet;
		} catch (e) {
			// If any check fails without throwing above, return false
		}
		return false;
	};
} else {
	/** @type {import('.')} */
	module.exports = function isWeakSet(x) {
		// WeakSet does not exist or `has` method is not found
		return false;
	};
}
