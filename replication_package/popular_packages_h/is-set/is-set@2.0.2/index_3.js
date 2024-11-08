'use strict';

// Check if Map and Set constructors are available and have prototypes
var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

var exported;

// If Set is not available, define exported as a function that always returns false
if (!$Set) {
	exported = function isSet(x) {
		return false;
	};
}

// Check if Map and Set have the 'has' method available
var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;

// If Set's 'has' method is not available and exported is not yet defined, define it to return false
if (!exported && !$setHas) {
	exported = function isSet(x) {
		return false;
	};
}

// Export the function to check if a value is a Set
module.exports = exported || function isSet(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Try calling Set's 'has' method
		$setHas.call(x);
		
		// Check if Map's 'has' method fails, which signifies the object is likely a Set
		if ($mapHas) {
			try {
				$mapHas.call(x);
			} catch (e) {
				return true;
			}
		}
		// Check instance with $Set for environments with core-js workaround
		return x instanceof $Set;
	} catch (e) {}
	return false;
};
