'use strict';

function canDefineProperty() {
    try {
        var testObject = {};
        Object.defineProperty(testObject, 'testProperty', { value: 42 });
        return testObject.testProperty === 42;
    } catch (e) {
        return false;
    }
}

var defineProperty = canDefineProperty() ? Object.defineProperty : false;

module.exports = defineProperty;
```