'use strict';

const hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
const hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;

let isWeakSetFunction = null;

if (!hasWeakMap) {
	isWeakSetFunction = function isWeakSet(x) {
		return false;
	};
}

const weakMapHasMethod = hasWeakMap ? WeakMap.prototype.has : null;
const weakSetHasMethod = hasWeakSet ? WeakSet.prototype.has : null;

if (!isWeakSetFunction && !weakSetHasMethod) {
	module.exports = function isWeakSet(x) {
		return false;
	};
} else {
	module.exports = function isWeakSet(x) {
		if (!x || typeof x !== 'object') {
			return false;
		}
		try {
			weakSetHasMethod.call(x, weakSetHasMethod);
			if (weakMapHasMethod) {
				try {
					weakMapHasMethod.call(x, weakMapHasMethod);
				} catch (e) {
					return true;
				}
			}
			return x instanceof WeakSet;
		} catch (e) {
			return false;
		}
	};
}
