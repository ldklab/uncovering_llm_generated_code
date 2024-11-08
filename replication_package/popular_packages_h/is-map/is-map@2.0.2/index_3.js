'use strict';

var $Map = typeof Map === 'function' ? Map : null;
var $Set = typeof Set === 'function' ? Set : null;

var exported;

// Check if Map is not available in the environment
if (!$Map) {
	// Define the exported function that always returns false
	exported = function isMap(x) {
		return false;
	};
}

var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;

// Check if Map doesn't have a 'has' method
if (!exported && !$mapHas) {
	// Define the exported function that always returns false
	exported = function isMap(x) {
		return false;
	};
}

// Main function to check if the variable is a Map
module.exports = exported || function isMap(x) {
	// Check if the input is not an object
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Try calling the 'has' method on the input
		$mapHas.call(x);

		if ($setHas) {
			try {
				// Try calling the 'has' method of Set, on the input
				$setHas.call(x);
			} catch (e) {
				// If calling Set's 'has' method throws, it indicates a Map
				return true;
			}
		}
		// Check using instanceof for environments with older versions of core-js
		return x instanceof $Map;
	} catch (e) {
		// If any error occurs, return false
	}
	return false;
};
