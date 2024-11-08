'use strict';

const isWeakMapAvailable = typeof WeakMap === 'function' && 'has' in WeakMap.prototype;
const isWeakSetAvailable = typeof WeakSet === 'function' && 'has' in WeakSet.prototype;

let isWeakSet;

if (!isWeakMapAvailable) {
	isWeakSet = function (x) {
		return false;
	};
} else if (!isWeakSetAvailable) {
	isWeakSet = function (x) {
		return false;
	};
} else {
	isWeakSet = function (x) {
		if (!x || typeof x !== 'object') {
			return false;
		}
		try {
			WeakSet.prototype.has.call(x, WeakSet.prototype.has);
			try {
				WeakMap.prototype.has.call(x, WeakMap.prototype.has);
			} catch (e) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	};
}

module.exports = isWeakSet;
