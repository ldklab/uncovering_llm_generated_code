// Functionality: Checks and exports support for Object.defineProperty.

'use strict';

const isDefinePropertySupported = (() => {
    try {
        // Attempt to define a property with a value on an object
        const testObject = {};
        Object.defineProperty(testObject, 'propertyCheck', { value: 42 });
        // Confirm if the property is defined with the expected value
        return testObject.propertyCheck === 42;
    } catch (error) {
        // Return false if any error occurs, usually in older environments
        return false;
    }
})();

// Export the result: either the Object.defineProperty method or false
module.exports = isDefinePropertySupported ? Object.defineProperty : false;
```