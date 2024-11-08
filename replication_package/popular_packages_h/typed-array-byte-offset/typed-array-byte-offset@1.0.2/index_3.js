'use strict';

const forEach = require('for-each');
const callBind = require('call-bind');
const typedArrays = require('available-typed-arrays')();
const hasProto = require('has-proto')();
const gOPD = require('gopd');
const isTypedArray = require('is-typed-array');
const oDP = Object.defineProperty;

/** @typedef {Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} TypedArray */
/** @typedef {(x: TypedArray) => number} ByteOffsetGetter */

// Define an object to store byte offset getters for different typed arrays
const getters = {};

if (gOPD) {
    const getByteOffset = function (x) {
        return x.byteOffset;
    };

    forEach(typedArrays, function (typedArray) {
        if (typeof global[typedArray] === 'function' || typeof global[typedArray] === 'object') {
            const Proto = global[typedArray].prototype;
            let descriptor = gOPD(Proto, 'byteOffset');
            if (!descriptor && hasProto) {
                const superProto = Proto.__proto__;
                descriptor = gOPD(superProto, 'byteOffset');
            }
            if (descriptor && descriptor.get) {
                getters[typedArray] = callBind(descriptor.get);
            } else if (oDP) {
                const arr = new global[typedArray](2);
                descriptor = gOPD(arr, 'byteOffset');
                if (descriptor && descriptor.configurable) {
                    oDP(arr, 'length', { value: 3 });
                }
                if (arr.length === 2) {
                    getters[typedArray] = getByteOffset;
                }
            }
        }
    });
}

// Function to attempt retrieving the byte offset based on available getters
const tryTypedArrays = function (value) {
    let foundOffset;
    forEach(getters, function (getter) {
        if (typeof foundOffset !== 'number') {
            try {
                const offset = getter(value);
                if (typeof offset === 'number') {
                    foundOffset = offset;
                }
            } catch (e) {}
        }
    });
    return foundOffset;
};

// Exported function to check if a value is a typed array and get its byte offset
module.exports = function typedArrayByteOffset(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
