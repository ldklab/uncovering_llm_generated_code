'use strict';

var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

var exported;

// Check if Set is supported
if (!$Set) {
	// If Set is not available, define isSet function that always returns false
	exported = function isSet(x) {
		return false;
	};
}

var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;

// If isSet has not been defined and Set.prototype.has is not available
if (!exported && !$setHas) {
	exported = function isSet(x) {
		return false;
	};
}

// Define the isSet function to export
module.exports = exported || function isSet(x) {
	// Check if x is an object
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Check if the `has` method of Set prototype can be applied to the argument
		$setHas.call(x);
		// If Map prototype is supported, attempt to apply its `has` method
		if ($mapHas) {
			try {
				$mapHas.call(x);
			} catch (e) {
				// If an error is thrown, it indicates x is a Set
				return true;
			}
		}
		// If no error, check if x is an instance of Set
		return x instanceof $Set;
	} catch (e) {
		// If an error occurs during the check, return false
	}
	return false;
};
