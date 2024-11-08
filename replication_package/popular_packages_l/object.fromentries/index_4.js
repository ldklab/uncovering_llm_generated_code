// object.fromentries/index.js

module.exports = (function() {
    const isNativeSupported = typeof Object.fromEntries === 'function';

    function fromEntries(iterable) {
        if (iterable == null) {
            throw new TypeError('Provided iterable is null or undefined');
        }

        const resultObject = {};
        const array = Array.isArray(iterable) ? iterable : Array.from(iterable);

        for (const entry of array) {
            if (typeof entry !== 'object' || entry === null) {
                throw new TypeError(`Iterator value ${entry} is not an entry object`);
            }
            const [key, value] = entry;
            resultObject[key] = value;
        }

        return resultObject;
    }

    fromEntries.shim = function() {
        if (!isNativeSupported) {
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
