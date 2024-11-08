'use strict';

const $Map = typeof Map === 'function' && Map.prototype ? Map : null;
const $Set = typeof Set === 'function' && Set.prototype ? Set : null;

let exported;

if (!$Set) {
	// If `Set` is not present in the environment, the function always returns false.
	exported = function isSet(x) {
		return false;
	};
}

const $mapHas = $Map ? Map.prototype.has : null;
const $setHas = $Set ? Set.prototype.has : null;

if (!exported && !$setHas) {
	// If `Set` does not have a `has` method, the function always returns false.
	exported = function isSet(x) {
		return false;
	};
}

module.exports = exported || function isSet(x) {
	// Check if the input `x` is a Set.
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		$setHas.call(x);
		if ($mapHas) {
			try {
				$mapHas.call(x);
			} catch (e) {
				return true; // `x` is a Set, as it does not have Map behavior.
			}
		}
		return x instanceof $Set;
	} catch (e) {}
	return false;
};
