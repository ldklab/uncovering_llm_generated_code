'use strict';

const hasMapSupport = typeof Map === 'function' && Map.prototype;
const hasSetSupport = typeof Set === 'function' && Set.prototype;

let isMapFunction;

if (!hasMapSupport) {
	isMapFunction = function isMap(x) {
		// `Map` is not present in this environment.
		return false;
	};
}

const mapHasMethod = hasMapSupport ? Map.prototype.has : null;
const setHasMethod = hasSetSupport ? Set.prototype.has : null;

if (!isMapFunction && !mapHasMethod) {
	isMapFunction = function isMap(x) {
		// `Map` does not have a `has` method
		return false;
	};
}

module.exports = isMapFunction || function isMap(x) {
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
		return x instanceof Map; // core-js workaround, pre-v2.5.0
	} catch (e) {}
	return false;
};
