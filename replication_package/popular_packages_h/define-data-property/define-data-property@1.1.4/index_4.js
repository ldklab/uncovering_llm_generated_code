'use strict';

const defineProperty = require('es-define-property');
const SyntaxErrorCustom = require('es-errors/syntax');
const TypeErrorCustom = require('es-errors/type');
const getOwnPropertyDescriptor = require('gopd');

module.exports = function defineDataProperty(obj, property, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
        throw new TypeErrorCustom('`obj` must be an object or a function');
    }
    if (typeof property !== 'string' && typeof property !== 'symbol') {
        throw new TypeErrorCustom('`property` must be a string or a symbol');
    }
    if (typeof nonEnumerable !== 'boolean' && nonEnumerable !== null) {
        throw new TypeErrorCustom('`nonEnumerable`, if provided, must be a boolean or null');
    }
    if (typeof nonWritable !== 'boolean' && nonWritable !== null) {
        throw new TypeErrorCustom('`nonWritable`, if provided, must be a boolean or null');
    }
    if (typeof nonConfigurable !== 'boolean' && nonConfigurable !== null) {
        throw new TypeErrorCustom('`nonConfigurable`, if provided, must be a boolean or null');
    }
    if (typeof loose !== 'boolean') {
        throw new TypeErrorCustom('`loose`, if provided, must be a boolean');
    }

    const desc = getOwnPropertyDescriptor && getOwnPropertyDescriptor(obj, property);

    if (defineProperty) {
        defineProperty(obj, property, {
            configurable: nonConfigurable === null ? (desc ? desc.configurable : true) : !nonConfigurable,
            enumerable: nonEnumerable === null ? (desc ? desc.enumerable : true) : !nonEnumerable,
            value: value,
            writable: nonWritable === null ? (desc ? desc.writable : true) : !nonWritable
        });
    } else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
        obj[property] = value; 
    } else {
        throw new SyntaxErrorCustom('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
    }
};
