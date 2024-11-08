// object.fromentries/index.js

module.exports = (function() {
    var hasNativeSupport = typeof Object.fromEntries === 'function';

    function fromEntries(iter) {
        // Validate if the iterable is either an array or implements the iterator protocol
        if (iter === null || iter === undefined) {
            throw new TypeError('iterable is null or not defined');
        }
        // Initialize output object
        var obj = {};
        // Coerce iterable to array if not already
        var arr = Array.isArray(iter) ? iter : Array.from(iter);
        
        for (var i = 0; i < arr.length; i++) {
            var entry = arr[i];
            if (Object(entry) !== entry) {
                throw new TypeError('Iterator value ' + entry + ' is not an entry object');
            }
            // Destructure key-value pair and assign to object
            var key = entry[0];
            var value = entry[1];
            obj[key] = value;
        }
        // Return constructed object
        return obj;
    }

    // Shim method to install `Object.fromEntries` globally
    fromEntries.shim = function shim() {
        if (!hasNativeSupport) {
            Object.defineProperty(Object, 'fromEntries', {
                configurable: true,
                enumerable: false,
                value: fromEntries,
                writable: true
            });
        }
        return Object.fromEntries;
    };

    return fromEntries;
})();
