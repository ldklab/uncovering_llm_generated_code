'use strict';

var isMapSupported = typeof Map === 'function' && Map.prototype; 
var isSetSupported = typeof Set === 'function' && Set.prototype;

var isSetFunction;

// Check if Set is unsupported in the environment
if (!isSetSupported) {
	isSetFunction = function isSet(x) {
		// `Set` is not present in the current environment
		return false;
	};
}

var mapHasMethod = isMapSupported ? Map.prototype.has : null;
var setHasMethod = isSetSupported ? Set.prototype.has : null;

// Check if Set is supported but does not have the `has` method
if (!isSetFunction && !setHasMethod) {
	isSetFunction = function isSet(x) {
		// `Set` does not have a `has` method in this environment
		return false;
	};
}

module.exports = isSetFunction || function isSet(x) {
	// Check if input is truthy and of object type
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		// Attempt to invoke `has` method on Set
		setHasMethod.call(x);
		if (mapHasMethod) {
			try {
				// Check if invoking `has` method of Map throws an error on Set, indicating `x` is likely a Set
				mapHasMethod.call(x);
			} catch (e) {
				return true;
			}
		}
		// Fallback check using instance of Set
		return x instanceof isSetSupported; 
	} catch (e) {
		// Any errors imply the object is not a Set
		return false;
	}
};
