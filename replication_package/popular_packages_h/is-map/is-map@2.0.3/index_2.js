'use strict';

/** @const */
const $Map = typeof Map === 'function' ? Map : null;
const $Set = typeof Set === 'function' ? Set : null;

// Exported function placeholder
let exported;

// If Map is not available, the isMap function always returns false
if (!$Map) {
	exported = function isMap(x) {
		return false;
	};
} else {
	const $mapHas = Map.prototype.has;
	const $setHas = $Set ? Set.prototype.has : null;

	// If the environment has Map but not the 'has' method
	if (!$mapHas) {
		exported = function isMap(x) {
			return false;
		};
	} else {
		// Define the actual isMap function
		exported = function isMap(x) {
			if (!x || typeof x !== 'object') {
				return false;
			}
			try {
				$mapHas.call(x);
				if ($setHas) {
					try {
						$setHas.call(x);
					} catch (e) {
						return true;
					}
				}
				return x instanceof $Map; // Ensures x is a Map, especially in environments with older polyfills
			} catch (e) {
				return false;
			}
		};
	}
}

// Export the isMap function
module.exports = exported;
