function defineDataProperty(obj, key, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
    const supportsDescriptors = (() => {
        try {
            Object.defineProperty({}, 'test', { value: 1 });
            return true;
        } catch (e) {
            return false;
        }
    })();

    if (supportsDescriptors) {
        const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key) || {};
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: nonEnumerable === null ? !!existingDescriptor.enumerable : !nonEnumerable,
            writable: nonWritable === null ? !!existingDescriptor.writable : !nonWritable,
            configurable: nonConfigurable === null ? !!existingDescriptor.configurable : !nonConfigurable
        });
    } else {
        if (loose || (nonEnumerable === null && nonWritable === null && nonConfigurable === null)) {
            obj[key] = value;
        } else {
            throw new Error('This environment does not support property descriptors');
        }
    }
}

// Example usage

const obj = {};
defineDataProperty(obj, 'key', 'value');
defineDataProperty(
    obj,
    'key2',
    'value',
    true,  // nonEnumerable
    false, // nonWritable
    true,  // nonConfigurable
    false  // loose
);

console.log(Object.getOwnPropertyDescriptors(obj));
