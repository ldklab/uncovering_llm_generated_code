'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');

// Retrieve the intrinsic WeakSet constructor, if available
var $WeakSet = GetIntrinsic('%WeakSet%', true);

// Safely retrieve the `has` method from WeakSet.prototype, if available
var $setHas = callBound('WeakSet.prototype.has', true);

if ($setHas) {
    // Safely retrieve the `has` method from WeakMap.prototype, if available
    var $mapHas = callBound('WeakMap.prototype.has', true);

    /**
     * Function to check if the input is a WeakSet
     * @param {*} x - Input to check
     * @returns {boolean} - True if input is a WeakSet, otherwise false
     */
    module.exports = function isWeakSet(x) {
        if (!x || typeof x !== 'object') {
            return false;
        }
        try {
            // Attempt to call WeakSet.prototype.has on input
            $setHas(x, $setHas);
            if ($mapHas) {
                try {
                    // Attempt to call WeakMap.prototype.has on input
                    $mapHas(x, $mapHas);
                } catch (e) {
                    // If calling WeakMap.prototype.has throws, it's a WeakSet
                    return true;
                }
            }
            // Fallback check using instanceof
            return x instanceof $WeakSet;
        } catch (e) {
            // If any exception occurs, return false
        }
        return false;
    };
} else {
    /**
     * Fallback function if WeakSet or its `has` method is unavailable
     * @param {*} x - Input to check
     * @returns {boolean} - Always false
     */
    module.exports = function isWeakSet(x) {
        return false;
    };
}
