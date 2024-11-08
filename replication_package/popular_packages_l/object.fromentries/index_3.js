// An implementation of `Object.fromEntries` that works as a polyfill if not natively supported

module.exports = (function() {
    // Check if native support is available
    const hasNativeSupport = typeof Object.fromEntries === 'function';

    // Custom fromEntries function definition for converting iterable to object
    const fromEntries = (iterable) => {
        // Check for null or undefined input
        if (iterable == null) {
            throw new TypeError('iterable is null or not defined');
        }

        // Initialize an empty result object
        const resultObject = {};
        // Convert the input to an array if it's not already
        const entriesArray = Array.isArray(iterable) ? iterable : Array.from(iterable);

        // Iterate over each entry in the array
        for (let entry of entriesArray) {
            // Ensure the entry is a valid key-value pair
            if (Object(entry) !== entry) {
                throw new TypeError(`Iterator value ${entry} is not an entry object`);
            }
            // Destructure the entry into key and value
            const [key, value] = entry;
            // Assign the key-value pair to the result object
            resultObject[key] = value;
        }

        // Return the constructed object
        return resultObject;
    };

    // Shim method to manually add `Object.fromEntries` if not supported natively
    fromEntries.shim = function() {
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

    // Expose the custom fromEntries function
    return fromEntries;
})();
