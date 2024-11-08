'use strict';

var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

function isMapFallback(x) {
	return false;
}

var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;

var isMapImplementation = function (x) {
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

function isMap(x) {
	if (!$Map || !$mapHas) {
		return isMapFallback(x);
	}
	return isMapImplementation(x);
}

module.exports = isMap;
