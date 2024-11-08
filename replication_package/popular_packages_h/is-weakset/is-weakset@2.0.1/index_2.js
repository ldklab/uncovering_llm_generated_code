'use strict';

var WeakMapAvailable = typeof WeakMap === 'function' && WeakMap.prototype;
var WeakSetAvailable = typeof WeakSet === 'function' && WeakSet.prototype;

var isWeakSet;

if (!WeakMapAvailable) {
	isWeakSet = function(x) {
		// WeakSet is not available
		return false;
	};
}

var mapHas = WeakMapAvailable ? WeakMap.prototype.has : null;
var setHas = WeakSetAvailable ? WeakSet.prototype.has : null;

if (!isWeakSet && !setHas) {
	module.exports = function(x) {
		// WeakSet doesn't have a 'has' method.
		return false;
	};
}

module.exports = isWeakSet || function(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		setHas.call(x, setHas);
		if (mapHas) {
			try {
				mapHas.call(x, mapHas);
			} catch (e) {
				return true;
			}
		}
		return x instanceof WeakSet; // core-js workaround, pre-v3
	} catch (e) {}
	return false;
};
