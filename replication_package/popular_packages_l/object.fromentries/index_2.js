module.exports = (function() {
    const hasNativeSupport = typeof Object.fromEntries === 'function';

    function fromEntries(iterable) {
        if (iterable == null) {
            throw new TypeError('iterable is null or not defined');
        }

        const result = {};
        const entries = Array.isArray(iterable) ? iterable : Array.from(iterable);

        for (const entry of entries) {
            if (Object(entry) !== entry) {
                throw new TypeError(`Iterator value ${entry} is not an entry object`);
            }

            const [key, value] = entry;
            result[key] = value;
        }

        return result;
    }

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
