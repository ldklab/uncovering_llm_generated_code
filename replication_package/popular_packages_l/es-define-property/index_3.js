'use strict';

// Check if Object.defineProperty is supported in the current environment
var isDefinePropertySupported = (function() {
    try {
        // Attempt to define a property using Object.defineProperty
        var testObject = {};
        Object.defineProperty(testObject, 'example', { value: 42 });
        // Check if the property was set correctly
        return testObject.example === 42;
    } catch (error) {
        // Return false if an error is caught (e.g., unsupported environment)
        return false;
    }
})();

// Export Object.defineProperty if supported, otherwise export false
module.exports = isDefinePropertySupported ? Object.defineProperty : false;
```