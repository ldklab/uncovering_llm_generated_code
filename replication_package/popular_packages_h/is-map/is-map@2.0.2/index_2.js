'use strict';

var $Map = typeof Map === 'function' ? Map : null;
var $Set = typeof Set === 'function' ? Set : null;

var exported = function isAlwaysFalse() { return false; };

if ($Map) {
	var $mapHas = Map.prototype.has;

	if ($mapHas) {
		exported = function isMap(x) {
			if (!x || typeof x !== 'object') {
				return false;
			}
			try {
				$mapHas.call(x);
				if ($Set) {
					try {
						Set.prototype.has.call(x);
					} catch (e) {
						return true;
					}
				}
				return x instanceof $Map; // core-js workaround, pre-v2.5.0
			} catch (e) {}
			return false;
		};
	}
}

module.exports = exported;
