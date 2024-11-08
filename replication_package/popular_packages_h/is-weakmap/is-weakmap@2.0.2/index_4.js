'use strict';

const isFunction = (fn) => typeof fn === 'function';

const $WeakMap = isFunction(WeakMap) && WeakMap.prototype ? WeakMap : null;
const $WeakSet = isFunction(WeakSet) && WeakSet.prototype ? WeakSet : null;

let exported;

if (!$WeakMap) {
	// If WeakMap is not present in the environment
	exported = function isWeakMap(x) {
		return false;
	};
}

const $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
const $setHas = $WeakSet ? $WeakSet.prototype.has : null;

if (!exported && !$mapHas) {
	// If WeakMap exists, but 'has' method does not
	exported = function isWeakMap(x) {
		return false;
	};
}

module.exports = exported || function isWeakMap(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		$mapHas.call(x, $mapHas);
		if ($setHas) {
			try {
				$setHas.call(x, $setHas);
			} catch (e) {
				return true;
			}
		}
		return x instanceof $WeakMap; // For environments with older JavaScript versions
	} catch (e) {
	}
	return false;
};
