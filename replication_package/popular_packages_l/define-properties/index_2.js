// define-properties/index.js

function defineProperties(target, properties, predicates = {}) {
    if (!target || typeof target !== 'object') {
        throw new TypeError('Target must be an object');
    }
    if (!properties || typeof properties !== 'object') {
        throw new TypeError('Properties must be an object');
    }

    // Check for support of property descriptors
    const supportsDescriptors = (() => {
        try {
            Object.defineProperty({}, 'test', { value: 42 });
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Define each property on target with optional checking if it should override
    for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
            const shouldOverride = predicates[key] ? !!predicates[key]() : false;
            if (!shouldOverride && key in target) {
                continue;
            }
            if (supportsDescriptors) {
                Object.defineProperty(target, key, {
                    configurable: true,
                    enumerable: false,
                    value: properties[key],
                    writable: false
                });
            } else {
                target[key] = properties[key];
            }
        }
    }
    
    defineProperties.supportsDescriptors = supportsDescriptors;
    return target;
}

module.exports = defineProperties;

// Usage example:

const define = require('./index');
const assert = require('assert');

const obj1 = define({ a: 1, b: 2 }, { a: 10, b: 20, c: 30 });
assert(obj1.a === 1);
assert(obj1.b === 2);
assert(obj1.c === 30);

const obj2 = define({ a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 30 }, {
    a: () => false,
    b: () => true
});
assert(obj2.a === 1);
assert(obj2.b === 20);
assert(obj2.c === 3);

if (define.supportsDescriptors) {
    console.log(Object.keys(obj1)); // Output: ['a', 'b']
    console.log(Object.getOwnPropertyDescriptor(obj1, 'c')); // Output: { configurable: true, enumerable: false, value: 30, writable: false }
}
