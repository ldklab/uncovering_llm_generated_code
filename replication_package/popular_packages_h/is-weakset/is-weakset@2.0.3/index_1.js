'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');

// Obtain the intrinsic WeakSet function if it exists
var $WeakSet = GetIntrinsic('%WeakSet%', true);

// Obtain the bound method WeakSet.prototype.has if it exists
var $setHas = callBound('WeakSet.prototype.has', true);

if ($setHas) {
    // Obtain the bound method WeakMap.prototype.has if it exists
    var $mapHas = callBound('WeakMap.prototype.has', true);

    module.exports = function isWeakSet(x) {
        // Check if x is a valid object
        if (!x || typeof x !== 'object') {
            return false;
        }
        try {
            // Check if x is a WeakSet by seeing if it can invoke the has method
            $setHas(x, $setHas);
            if ($mapHas) {
                try {
                    // Attempt to use WeakMap.prototype.has; failure indicates x is a WeakSet
                    $mapHas(x, $mapHas);
                } catch (e) {
                    return true;
                }
            }
            // Final check: if the intrinsic WeakSet exists, confirm x is an instance
            return x instanceof $WeakSet;
        } catch (e) {}
        return false;
    };
} else {
    module.exports = function isWeakSet(x) {
        // If WeakSet or its method 'has' does not exist, return false
        return false;
    };
}
