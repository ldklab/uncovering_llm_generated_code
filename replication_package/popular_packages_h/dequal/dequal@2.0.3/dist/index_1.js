function dequal(value1, value2) {
    if (value1 === value2) return true;

    if (value1 && value2 && value1.constructor === value2.constructor) {
        const type = value1.constructor;

        if (type === Date) return value1.getTime() === value2.getTime();
        if (type === RegExp) return value1.toString() === value2.toString();

        if (type === Array) {
            return value1.length === value2.length &&
                value1.every((item, index) => dequal(item, value2[index]));
        }

        if (type === Set) {
            return value1.size === value2.size &&
                [...value1].every(item => {
                    if (typeof item === 'object' && item !== null) {
                        const found = [...value2].find(el => dequal(item, el));
                        return found !== undefined;
                    }
                    return value2.has(item);
                });
        }

        if (type === Map) {
            return value1.size === value2.size &&
                [...value1.entries()].every(([key, val]) => {
                    const matchingKey = [...value2.keys()].find(k => 
                        dequal(k, key)
                    );
                    return matchingKey !== undefined && dequal(value2.get(matchingKey), val);
                });
        }

        if (type === ArrayBuffer || ArrayBuffer.isView(value1)) {
            const buffer1 = type === ArrayBuffer ? new Uint8Array(value1) : value1;
            const buffer2 = type === ArrayBuffer ? new Uint8Array(value2) : value2;
            return buffer1.byteLength === buffer2.byteLength &&
                buffer1.every((byte, i) => byte === buffer2[i]);
        }

        if (typeof value1 === 'object') {
            const keys1 = Object.keys(value1);
            const keys2 = Object.keys(value2);
            return keys1.length === keys2.length &&
                keys1.every(key => value2.hasOwnProperty(key) && dequal(value1[key], value2[key]));
        }
    }

    return value1 !== value1 && value2 !== value2; // NaN check
}

exports.dequal = dequal;
