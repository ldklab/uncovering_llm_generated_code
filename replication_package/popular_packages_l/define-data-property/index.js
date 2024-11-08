function defineDataProperty(obj, key, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
    var canUseDescriptors = false;
    try {
        Object.defineProperty({}, 'test', { value: 1 });
        canUseDescriptors = true;
    } catch (e) {}

    if (canUseDescriptors) {
        var desc = Object.getOwnPropertyDescriptor(obj, key) || {};
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: nonEnumerable === null ? !!desc.enumerable : !nonEnumerable,
            writable: nonWritable === null ? !!desc.writable : !nonWritable,
            configurable: nonConfigurable === null ? !!desc.configurable : !nonConfigurable
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

var obj = {};
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
