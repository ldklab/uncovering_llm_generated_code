const hasOwnProp = Object.prototype.hasOwnProperty;

function findKey(iterator, target) {
    for (let key of iterator.keys()) {
        if (dequal(key, target)) return key;
    }
}

function dequal(x, y) {
    if (x === y) return true;
    if (x !== x && y !== y) return true; // Handle NaN

    if (x && y && x.constructor === y.constructor) {
        const ctor = x.constructor;

        if (ctor === Date) return x.getTime() === y.getTime();
        if (ctor === RegExp) return x.toString() === y.toString();
        
        if (ctor === Array) {
            if (x.length !== y.length) return false;
            for (let i = 0; i < x.length; i++) {
                if (!dequal(x[i], y[i])) return false;
            }
            return true;
        }

        if (ctor === Set) {
            if (x.size !== y.size) return false;
            for (let value of x) {
                let objValue = value;
                if (typeof value === 'object') objValue = findKey(y, value);
                if (!y.has(objValue)) return false;
            }
            return true;
        }

        if (ctor === Map) {
            if (x.size !== y.size) return false;
            for (let [key, val] of x) {
                let objKey = key;
                if (typeof key === 'object') objKey = findKey(y, key);
                if (!dequal(val, y.get(objKey))) return false;
            }
            return true;
        }

        if (ctor === ArrayBuffer || ArrayBuffer.isView(x)) {
            if (x.byteLength !== y.byteLength) return false;
            const xArr = new Uint8Array(x);
            const yArr = new Uint8Array(y);
            for (let i = 0; i < x.byteLength; i++) {
                if (xArr[i] !== yArr[i]) return false;
            }
            return true;
        }

        if (typeof x === 'object') {
            const xKeys = Object.keys(x);
            const yKeys = Object.keys(y);
            if (xKeys.length !== yKeys.length) return false;
            for (let key of xKeys) {
                if (!hasOwnProp.call(y, key) || !dequal(x[key], y[key])) return false;
            }
            return true;
        }
    }

    return false;
}

module.exports.dequal = dequal;
