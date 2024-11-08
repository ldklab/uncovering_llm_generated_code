function defineDataProperty(obj, key, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
    let canUseDescriptors = false;
    try {
        Object.defineProperty({}, 'test', { value: 1 });
        canUseDescriptors = true;
    } catch (e) {}

    if (canUseDescriptors) {
        const currentDescriptor = Object.getOwnPropertyDescriptor(obj, key) || {};
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: nonEnumerable !== null ? !nonEnumerable : !!currentDescriptor.enumerable,
            writable: nonWritable !== null ? !nonWritable : !!currentDescriptor.writable,
            configurable: nonConfigurable !== null ? !nonConfigurable : !!currentDescriptor.configurable
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

let obj = {};
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
