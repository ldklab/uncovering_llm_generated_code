const hasOwnProperty = Object.prototype.hasOwnProperty;

function findInIterable(iterable, target) {
    for (const key of iterable.keys()) {
        if (deepEqual(key, target)) return key;
    }
}

function deepEqual(a, b) {
    if (a === b) return true;

    if (a && b && a.constructor === b.constructor) {
        const constructor = a.constructor;

        if (constructor === Date) return a.getTime() === b.getTime();
        if (constructor === RegExp) return a.toString() === b.toString();

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!deepEqual(a[i], b[i])) return false;
            }
            return true;
        }

        if (constructor === Set || constructor === Map) {
            if (a.size !== b.size) return false;
            const entriesA = constructor === Map ? Array.from(a.entries()) : Array.from(a);
            const entriesB = constructor === Map ? Array.from(b.entries()) : Array.from(b);
            for (const [key, value] of entriesA) {
                const correspondingKey = key && typeof key === 'object' ? findInIterable(b, key) : key;
                if (!b.has(correspondingKey)) return false;
                if (constructor === Map && !deepEqual(value, b.get(correspondingKey))) return false;
            }
            return true;
        }

        if (constructor === ArrayBuffer || ArrayBuffer.isView(a)) {
            const arrayA = new Uint8Array(a);
            const arrayB = new Uint8Array(b);
            if (arrayA.length !== arrayB.length) return false;
            for (let i = 0; i < arrayA.length; i++) {
                if (arrayA[i] !== arrayB[i]) return false;
            }
            return true;
        }

        if (constructor === DataView) {
            if (a.byteLength !== b.byteLength) return false;
            for (let i = 0; i < a.byteLength; i++) {
                if (a.getInt8(i) !== b.getInt8(i)) return false;
            }
            return true;
        }

        if (typeof a === 'object') {
            const keysA = Object.keys(a);
            if (keysA.length !== Object.keys(b).length) return false;
            for (const key of keysA) {
                if (!hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
    }

    // Special case for NaN
    return a !== a && b !== b;
}

exports.deepEqual = deepEqual;
