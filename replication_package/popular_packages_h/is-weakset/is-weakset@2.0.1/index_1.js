'use strict';

const $WeakMap = typeof WeakMap === 'function' && WeakMap.prototype ? WeakMap : null;
const $WeakSet = typeof WeakSet === 'function' && WeakSet.prototype ? WeakSet : null;

let exportedFunction;

if (!$WeakMap) {
	// If WeakMap is not available, assume WeakSet is also unavailable
	exportedFunction = function isWeakSet(x) {
		return false;
	};
}

const $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
const $setHas = $WeakSet ? $WeakSet.prototype.has : null;
if (!exportedFunction && !$setHas) {
	// If the `has` method is not available on WeakSet, the function returns false
	module.exports = function isWeakSet(x) {
		return false;
	};
} else {
	module.exports = exportedFunction || function isWeakSet(x) {
		if (!x || typeof x !== 'object') {
			return false;
		}
		try {
			$setHas.call(x, $setHas);
			if ($mapHas) {
				try {
					$mapHas.call(x, $mapHas);
				} catch (e) {
					return true;
				}
			}
			return x instanceof $WeakSet; // Handling for environments with non-standard implementations
		} catch (e) {}
		return false;
	};
}
