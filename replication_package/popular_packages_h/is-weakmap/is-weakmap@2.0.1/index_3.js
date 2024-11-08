'use strict';

let isWeakMapAvailable = typeof WeakMap === 'function' && typeof WeakMap.prototype.has === 'function';
let isWeakSetAvailable = typeof WeakSet === 'function' && typeof WeakSet.prototype.has === 'function';

const isWeakMap = function(x) {
    if (!x || typeof x !== 'object') {
        return false;
    }
    
    if (!isWeakMapAvailable) {
        // WeakMap or its 'has' method is not available
        return false;
    }

    try {
        WeakMap.prototype.has.call(x, x);
        if (isWeakSetAvailable) {
            try {
                WeakSet.prototype.has.call(x, x);
            } catch (e) {
                return true;
            }
        }
        return x instanceof WeakMap; // core-js workaround, pre-v3
    } catch (e) {
        return false;
    }
};

module.exports = isWeakMap;
