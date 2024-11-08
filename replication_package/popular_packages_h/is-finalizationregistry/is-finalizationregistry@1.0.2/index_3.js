'use strict';

var callBound = require('call-bind/callBound');

// Attempt to get the `register` method from FinalizationRegistry if it exists
var $register = callBound('FinalizationRegistry.prototype.register', true);

module.exports = $register
    ? function isFinalizationRegistry(value) {
        // Check if the passed value is non-null and of type 'object'
        if (!value || typeof value !== 'object') {
            return false;
        }
        try {
            // Try to call the register method with the value and an empty object
            // If successful, it is a FinalizationRegistry and return true
            $register(value, {});
            return true;
        } catch (e) {
            // If an error is thrown, it is not a FinalizationRegistry and return false
            return false;
        }
    }
    : function isFinalizationRegistry(value) { // No-op function if FinalizationRegistry is not supported
        return false;
    };
