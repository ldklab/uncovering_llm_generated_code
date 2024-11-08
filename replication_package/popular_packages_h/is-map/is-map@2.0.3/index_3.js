'use strict';

/** @const */
const $Map = typeof Map === 'function' && Map.prototype ? Map : null;
const $Set = typeof Set === 'function' && Set.prototype ? Set : null;

let isMap;

if (!$Map) {
	// eslint-disable-next-line no-unused-vars
	isMap = function (x) {
		// `Map` is not present in this environment.
		return false;
	};
} else {
	const $mapHas = $Map.prototype.has;
	const $setHas = $Set ? $Set.prototype.has : null;
	if (!$mapHas) {
		// eslint-disable-next-line no-unused-vars
		isMap = function (x) {
			// `Map` does not have a `has` method
			return false;
		};
	} else {
		isMap = function (x) {
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
				return x instanceof $Map;
			} catch (e) {}
			return false;
		};
	}
}

module.exports = isMap;
