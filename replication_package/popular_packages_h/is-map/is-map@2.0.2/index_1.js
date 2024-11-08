'use strict';

const MapAvailable = typeof Map === 'function' && Map.prototype;
const SetAvailable = typeof Set === 'function' && Set.prototype;

const mapHasMethod = MapAvailable ? Map.prototype.has : null;
const setHasMethod = SetAvailable ? Set.prototype.has : null;

function isMap(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		mapHasMethod.call(x);
		if (setHasMethod) {
			try {
				setHasMethod.call(x);
			} catch (e) {
				return true;
			}
		}
		return x instanceof MapAvailable; // Supports environments that polyfill Map
	} catch (e) {
		return false;
	}
}

module.exports = MapAvailable && mapHasMethod ? isMap : function() { return false; };
