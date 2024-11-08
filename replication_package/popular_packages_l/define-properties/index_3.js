// define-properties/index.js

function defineProperties(target, properties, predicates = {}) {
    if (typeof target !== 'object' || target === null) {
        throw new TypeError('Target must be an object');
    }
    if (typeof properties !== 'object' || properties === null) {
        throw new TypeError('Properties must be an object');
    }

    const supportsDescriptors = checkSupportForDescriptors();

    for (const key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
            const shouldOverride = predicates[key] ? Boolean(predicates[key]()) : false;
            if (!shouldOverride && (key in target)) {
                continue;
            }
            if (supportsDescriptors) {
                definePropertyWithDescriptor(target, key, properties[key]);
            } else {
                target[key] = properties[key];
            }
        }
    }

    defineProperties.supportsDescriptors = supportsDescriptors;
    return target;
}

function checkSupportForDescriptors() {
    try {
        Object.defineProperty({}, 'test', { value: 42 });
        return true;
    } catch (e) {
        return false;
    }
}

function definePropertyWithDescriptor(target, key, value) {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: false,
        value: value,
        writable: false
    });
}

module.exports = defineProperties;

// Usage example:

const define = require('./index');
const assert = require('assert');

const obj1 = define({ a: 1, b: 2 }, { a: 10, b: 20, c: 30 });
assert.strictEqual(obj1.a, 1);
assert.strictEqual(obj1.b, 2);
assert.strictEqual(obj1.c, 30);

const obj2 = define({ a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 30 }, {
    a: () => false,
    b: () => true
});
assert.strictEqual(obj2.a, 1);
assert.strictEqual(obj2.b, 20);
assert.strictEqual(obj2.c, 3);

if (define.supportsDescriptors) {
    console.log(Object.keys(obj1));                    // Output: ['a', 'b']
    console.log(Object.getOwnPropertyDescriptor(obj1, 'c')); // Output: { configurable: true, enumerable: false, value: 30, writable: false }
}
