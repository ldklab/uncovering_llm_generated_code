'use strict';

const MapPrototype = typeof Map === 'function' && Map.prototype ? Map : null;
const SetPrototype = typeof Set === 'function' && Set.prototype ? Set : null;

let isSet;

if (!SetPrototype) {
	// If Set is not available in the environment, return false for any input.
	isSet = function(x) {
		return false;
	};
}

const mapHasMethod = MapPrototype ? Map.prototype.has : null;
const setHasMethod = SetPrototype ? Set.prototype.has : null;

if (!isSet && !setHasMethod) {
	// If the Set has method is not available, return false for any input.
	isSet = function(x) {
		return false;
	};
}

module.exports = isSet || function(x) {
	if (!x || typeof x !== 'object') {
		return false; // Non-object values can't be a Set
	}
	try {
		setHasMethod.call(x); // Try calling the `has` method
		if (mapHasMethod) {
			try {
				mapHasMethod.call(x);
			} catch (e) {
				return true; // If it doesn't have map.has, it might be a Set
			}
		}
		return x instanceof SetPrototype; // Check if x is an instance of Set
	} catch (e) {}
	return false; // If any errors occur, return false
};
