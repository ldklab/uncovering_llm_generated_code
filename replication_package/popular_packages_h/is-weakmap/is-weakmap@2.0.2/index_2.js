'use strict';

// Check for the presence of WeakMap and WeakSet constructors
var $WeakMap = typeof WeakMap === 'function' && WeakMap.prototype ? WeakMap : null;
var $WeakSet = typeof WeakSet === 'function' && WeakSet.prototype ? WeakSet : null;

// Variable to hold the exported function
var exported;

// If WeakMap is not supported, assign a function that always returns false
if (!$WeakMap) {
	exported = function isWeakMap(x) {
		// WeakMap is not supported in this environment
		return false;
	};
}

// Extract the `has` method from WeakMap and WeakSet prototypes
var $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
var $setHas = $WeakSet ? $WeakSet.prototype.has : null;

// If WeakMap does not have a `has` method, adjust the exported function
if (!exported && !$mapHas) {
	exported = function isWeakMap(x) {
		// WeakMap is missing `has` method
		return false;
	};
}

// Export the function to check if an object is a WeakMap
module.exports = exported || function isWeakMap(x) {
	// Check if x is a valid object
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Try to use the `has` method from WeakMap's prototype
		$mapHas.call(x, $mapHas);
		// If WeakSet is available, verify if it throws an error for WeakMap
		if ($setHas) {
			try {
				$setHas.call(x, $setHas);
			} catch (e) {
				return true;
			}
		}
		// Verify if x is an instance of WeakMap
		return x instanceof $WeakMap; // Workaround for core-js pre-v3
	} catch (e) {}
	return false;
};
