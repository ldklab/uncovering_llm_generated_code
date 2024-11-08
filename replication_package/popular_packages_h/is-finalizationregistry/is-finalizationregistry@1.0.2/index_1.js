'use strict';

const callBound = require('call-bind/callBound');

// Attempt to retrieve the `register` method from `FinalizationRegistry.prototype`
const $register = callBound('FinalizationRegistry.prototype.register', true);

// Export a function to check if a given value is a FinalizationRegistry
module.exports = $register
    ? function isFinalizationRegistry(value) {
        // Check if the value is a non-null object
        if (!value || typeof value !== 'object') {
            return false;
        }
        try {
            // Try to use $register with the value; if it works, it's a FinalizationRegistry
            $register(value, {});
            return true;
        } catch (e) {
            // If any error is caught, it means it's likely not a FinalizationRegistry
            return false;
        }
    }
    : function isFinalizationRegistry(value) {
        // If $register couldn't be retrieved, always return false
        return false;
    };
