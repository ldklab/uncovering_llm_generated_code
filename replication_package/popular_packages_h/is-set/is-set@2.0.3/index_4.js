'use strict';

// Attempt to determine if Map and Set are available in the environment
var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

// Declare a variable to hold the exported function
var exported;

// Check if Set is unavailable, and if so, define `isSet` to always return false
if (!$Set) {
	/** @type {function(*): boolean} */
	exported = function isSet(x) {
		// No Set in the environment
		return false;
	};
}

// Extract `has` methods from Map and Set prototypes, if available
var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;

// If `isSet` is not already exported and Set lacks a `has` method, define `isSet` to return false
if (!exported && !$setHas) {
	/** @type {function(*): boolean} */
	exported = function isSet(x) {
		// Set does not have a `has` method
		return false;
	};
}

// Default export: a function that checks if an object is a Set instance
module.exports = exported || function isSet(x) {
	// Check if the input is a non-null object
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Attempt to use the Set `has` method on the input
		$setHas.call(x);
		if ($mapHas) {
			try {
				// Attempt to use the Map `has` method on the input
				$mapHas.call(x);
			} catch (e) {
				// If `mapHas` throws an error, `x` is likely a Set
				return true;
			}
		}
		// Check if `x` is an instance of Set
		return x instanceof $Set;
	} catch (e) {
		// Catch any errors and return false
	}
	return false;
};
