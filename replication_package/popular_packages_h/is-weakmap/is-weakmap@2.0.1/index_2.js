'use strict';

var isWeakMap;

// Check if WeakMap is a function and has a prototype
var $WeakMap = typeof WeakMap === 'function' && WeakMap.prototype ? WeakMap : null;

// Check if WeakSet is a function and has a prototype for additional checks
var $WeakSet = typeof WeakSet === 'function' && WeakSet.prototype ? WeakSet : null;

// If WeakMap does not exist, define isWeakMap to always return false
if (!$WeakMap) {
	isWeakMap = function (x) {
		return false;
	};
}

// Check if WeakMap and WeakSet have the 'has' method
var $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
var $setHas = $WeakSet ? $WeakSet.prototype.has : null;

if (!isWeakMap && !$mapHas) {
	// If WeakMap is present but does not have 'has' method
	isWeakMap = function (x) {
		return false;
	};
}

// Default export function to check if an object is a WeakMap
module.exports = isWeakMap || function (x) {
	if (!x || typeof x !== 'object') {
		return false;
	}

	try {
		// Attempt to use the 'has' method specific to WeakMap
		$mapHas.call(x, $mapHas);
		
		// Additional check with WeakSet to avoid false positives
		if ($setHas) {
			try {
				$setHas.call(x, $setHas);
			} catch (e) {
				// If it throws, it's likely a WeakMap
				return true;
			}
		}

		// Final check for instance of WeakMap
		return x instanceof $WeakMap; // For compatibility with older versions, e.g., core-js
	} catch (e) {
		// Catch any errors and default to false
	}
	return false;
};
