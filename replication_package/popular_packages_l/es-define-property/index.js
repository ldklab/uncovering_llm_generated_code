// es-define-property implementation
'use strict';

var supportsDefineProperty = (function() {
    try {
        var obj = {};
        Object.defineProperty(obj, 'test', { value: 42 });
        return obj.test === 42;
    } catch (err) {
        return false;
    }
})();

module.exports = supportsDefineProperty ? Object.defineProperty : false;
```

The code checks if `Object.defineProperty` works as expected by trying to define a test property on an object and verifying its value. If it succeeds, it means `Object.defineProperty` is supported properly, and the package exports this native method. If it fails, indicating that the environment is likely IE 8 or an older ES3, it exports `false`.