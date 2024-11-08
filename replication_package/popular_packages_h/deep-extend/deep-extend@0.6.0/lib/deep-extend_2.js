'use strict';

function isSpecificType(value) {
    return value instanceof Buffer || value instanceof Date || value instanceof RegExp;
}

function cloneSpecificType(value) {
    if (value instanceof Buffer) {
        const bufferCopy = Buffer.alloc ? Buffer.alloc(value.length) : new Buffer(value.length);
        value.copy(bufferCopy);
        return bufferCopy;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
        return new RegExp(value);
    }
    throw new Error('Unexpected value type');
}

function deepCloneArray(array) {
    return array.map(item => {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                return deepCloneArray(item);
            }
            if (isSpecificType(item)) {
                return cloneSpecificType(item);
            }
            return deepExtend({}, item);
        }
        return item;
    });
}

function safeAccessProperty(object, property) {
    return property === '__proto__' ? undefined : object[property];
}

var deepExtend = module.exports = function () {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }

    if (arguments.length < 2) {
        return arguments[0];
    }

    const target = arguments[0];
    const sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(source => {
        if (typeof source !== 'object' || source === null || Array.isArray(source)) {
            return;
        }

        Object.keys(source).forEach(key => {
            const srcValue = safeAccessProperty(target, key);
            const newValue = safeAccessProperty(source, key);

            if (newValue === target) {
                return;
            } 

            if (typeof newValue !== 'object' || newValue === null) {
                target[key] = newValue;
            } else if (Array.isArray(newValue)) {
                target[key] = deepCloneArray(newValue);
            } else if (isSpecificType(newValue)) {
                target[key] = cloneSpecificType(newValue);
            } else if (typeof srcValue !== 'object' || srcValue === null || Array.isArray(srcValue)) {
                target[key] = deepExtend({}, newValue);
            } else {
                target[key] = deepExtend(srcValue, newValue);
            }
        });
    });

    return target;
};
