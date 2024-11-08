'use strict';

var $WeakMap = typeof WeakMap === 'function' && WeakMap.prototype ? WeakMap : null;
var $WeakSet = typeof WeakSet === 'function' && WeakSet.prototype ? WeakSet : null;

function defaultIsWeakMap(x) {
    // `WeakMap` is not present in this environment or does not have a `has` method.
    return false;
}

var $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
var $setHas = $WeakSet ? $WeakSet.prototype.has : null;

var isWeakMap = function isWeakMap(x) {
    if (!$WeakMap || !$mapHas) {
        return defaultIsWeakMap(x);
    }
    
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
        return x instanceof $WeakMap; // core-js workaround, pre-v3
    } catch (e) {
        return false;
    }
};

module.exports = isWeakMap;
