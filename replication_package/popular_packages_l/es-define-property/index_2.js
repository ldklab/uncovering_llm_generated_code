'use strict';

// Check if Object.defineProperty is supported
var isDefinePropertySupported = (function() {
    try {
        var testObject = {};
        Object.defineProperty(testObject, 'property', { value: 42 });
        return testObject.property === 42; // Check if the property was successfully defined
    } catch (error) {
        return false; // Fail if there is an error in defining the property
    }
})();

// Export Object.defineProperty if supported, otherwise export false
module.exports = isDefinePropertySupported ? Object.defineProperty : false;
```