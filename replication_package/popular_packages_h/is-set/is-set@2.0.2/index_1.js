'use strict';

var MapAvailable = typeof Map === 'function' && Map.prototype ? true : false;
var SetAvailable = typeof Set === 'function' && Set.prototype ? true : false;

var isSetFunction;

// If Set is not available, define `isSet` to always return false.
if (!SetAvailable) {
	isSetFunction = function(x) {
		// `Set` is not present in this environment.
		return false;
	};
} else {
	var mapHasMethod = MapAvailable ? Map.prototype.has : null;
	var setHasMethod = Set.prototype.has;

	// If Set is available but does not have the 'has' method, define `isSet` to always return false.
	if (!setHasMethod) {
		isSetFunction = function(x) {
			// `Set` does not have a `has` method.
			return false;
		};
	} else {
		// Define `isSet` to determine if an object is a Set.
		isSetFunction = function(x) {
			if (!x || typeof x !== 'object') {
				return false;
			}
			try {
				setHasMethod.call(x);
				if (mapHasMethod) {
					try {
						mapHasMethod.call(x);
					} catch (e) {
						return true;
					}
				}
				return x instanceof Set; // core-js workaround, pre-v2.5.0
			} catch (e) {
				return false;
			}
		};
	}
}

module.exports = isSetFunction;
