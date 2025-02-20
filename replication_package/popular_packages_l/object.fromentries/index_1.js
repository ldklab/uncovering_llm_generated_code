// object.fromentries/index.js

module.exports = (function() {
    // Check for native support of Object.fromEntries
    var hasNativeSupport = typeof Object.fromEntries === 'function';

    // Function to convert iterable into an object
    function fromEntries(iter) {
        // Check if iterable is null or undefined
        if (iter === null || iter === undefined) {
            throw new TypeError('iterable is null or not defined');
        }
        // Initialize an object to hold key-value pairs
        var obj = {};
        // Convert iterable to an array if it's not one already
        var arr = Array.isArray(iter) ? iter : Array.from(iter);
        
        // Iterate over array to process entries
        for (var i = 0; i < arr.length; i++) {
            var entry = arr[i];
            // Ensure each entry is an object
            if (Object(entry) !== entry) {
                throw new TypeError('Iterator value ' + entry + ' is not an entry object');
            }
            // Extract key and value from each entry and assign to the object
            var key = entry[0];
            var value = entry[1];
            obj[key] = value;
        }
        // Return the constructed object
        return obj;
    }

    // Method to add fromEntries to Object if it doesn't exist
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

    // Return the fromEntries function
    return fromEntries;
})();
