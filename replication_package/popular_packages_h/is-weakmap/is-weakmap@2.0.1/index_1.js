'use strict';

const $WeakMap = (typeof WeakMap === 'function' && WeakMap.prototype) ? WeakMap : null;
const $WeakSet = (typeof WeakSet === 'function' && WeakSet.prototype) ? WeakSet : null;

let isWeakMapFunction;

if (!$WeakMap) {
	// WeakMap is not available in this environment.
	isWeakMapFunction = function (x) {
		return false;
	};
} else {
	const $mapHas = $WeakMap.prototype.has;
	const $setHas = $WeakSet ? $WeakSet.prototype.has : null;

	if (!$mapHas) {
		// WeakMap does not have a 'has' method
		isWeakMapFunction = function (x) {
			return false;
		};
	} else {
		isWeakMapFunction = function (x) {
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
				return x instanceof $WeakMap; // For environments like core-js pre-v3
			} catch (e) {
				return false;
			}
		};
	}
}

module.exports = isWeakMapFunction;
