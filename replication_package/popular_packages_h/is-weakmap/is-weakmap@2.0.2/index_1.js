'use strict';

const hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
const hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;

let isWeakMapFunction;

// Handle environments without WeakMap support
if (!hasWeakMap) {
	isWeakMapFunction = () => false;
}

// Retrieve prototype methods if available
const weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
const weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;

// Handle environments where WeakMap has no `has` method
if (!isWeakMapFunction && !weakMapHas) {
	isWeakMapFunction = () => false;
}

// Export the function
module.exports = isWeakMapFunction || function isWeakMap(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		weakMapHas.call(x, weakMapHas);
		if (weakSetHas) {
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (e) {
				return true;
			}
		}
		return x instanceof WeakMap; // Compatibility with environments that support WeakMap
	} catch (e) {
		return false;
	}
};
