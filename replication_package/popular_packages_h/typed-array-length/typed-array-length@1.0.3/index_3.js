'use strict';

const forEach = require('foreach');
const callBind = require('call-bind');
const isTypedArray = require('is-typed-array');

const typedArrays = [
    'Float32Array',
    'Float64Array',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'BigInt64Array',
    'BigUint64Array'
];

const getters = {};
const hasProto = [].__proto__ === Array.prototype;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const defineProperty = Object.defineProperty;

if (getOwnPropertyDescriptor) {
    const getLength = (x) => x.length;
    
    forEach(typedArrays, (typedArray) => {
        if (typeof global[typedArray] === 'function' || typeof global[typedArray] === 'object') {
            const Proto = global[typedArray].prototype;
            let descriptor = getOwnPropertyDescriptor(Proto, 'length');
            
            if (!descriptor && hasProto) {
                const superProto = Proto.__proto__;
                descriptor = getOwnPropertyDescriptor(superProto, 'length');
            }
            
            if (descriptor && descriptor.get) {
                getters[typedArray] = callBind(descriptor.get);
            } else if (defineProperty) {
                const instance = new global[typedArray](2);
                descriptor = getOwnPropertyDescriptor(instance, 'length');
                
                if (descriptor && descriptor.configurable) {
                    defineProperty(instance, 'length', { value: 3 });
                }
                
                if (instance.length === 2) {
                    getters[typedArray] = getLength;
                }
            }
        }
    });
}

const tryTypedArrays = (value) => {
    let foundLength;
    
    forEach(getters, (getter) => {
        if (typeof foundLength !== 'number') {
            try {
                const length = getter(value);
                if (typeof length === 'number') {
                    foundLength = length;
                }
            } catch (e) { }
        }
    });

    return foundLength;
};

module.exports = function typedArrayLength(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
