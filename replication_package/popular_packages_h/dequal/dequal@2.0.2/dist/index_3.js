const hasOwnProperty = Object.prototype.hasOwnProperty;

function findMatchingKey(iterable, target) {
    for (const key of iterable.keys()) {
        if (deepEqual(key, target)) return key;
    }
}

function deepEqual(a, b) {
    if (a === b) return true;

    if (a && b && a.constructor === b.constructor) {
        switch (a.constructor) {
            case Date:
                return a.getTime() === b.getTime();
            case RegExp:
                return a.toString() === b.toString();
            case Array:
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!deepEqual(a[i], b[i])) return false;
                }
                return true;
            case Set:
                if (a.size !== b.size) return false;
                for (const item of a) {
                    const comparableItem = (item && typeof item === 'object') ? findMatchingKey(b, item) || item : item;
                    if (!b.has(comparableItem)) return false;
                }
                return true;
            case Map:
                if (a.size !== b.size) return false;
                for (const [key, value] of a) {
                    const comparableKey = (key && typeof key === 'object') ? findMatchingKey(b, key) || key : key;
                    if (!deepEqual(value, b.get(comparableKey))) return false;
                }
                return true;
            case ArrayBuffer:
                return deepEqual(new Uint8Array(a), new Uint8Array(b));
            case DataView:
                if (a.byteLength !== b.byteLength) return false;
                for (let i = 0; i < a.byteLength; i++) {
                    if (a.getInt8(i) !== b.getInt8(i)) return false;
                }
                return true;
            default:
                if (ArrayBuffer.isView(a)) {
                    if (a.byteLength !== b.byteLength) return false;
                    for (let i = 0; i < a.byteLength; i++) {
                        if (a[i] !== b[i]) return false;
                    }
                    return true;
                }
                if (typeof a === 'object') {
                    const aKeys = Object.keys(a);
                    const bKeys = Object.keys(b);
                    if (aKeys.length !== bKeys.length) return false;
                    for (const key of aKeys) {
                        if (!hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) return false;
                    }
                    return true;
                }
        }
    }

    return a !== a && b !== b; // handling NaN case
}

exports.deepEqual = deepEqual;
