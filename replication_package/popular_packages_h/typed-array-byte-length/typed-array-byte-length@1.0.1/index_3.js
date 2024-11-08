'use strict';

const callBind = require('call-bind');
const forEach = require('for-each');
const gOPD = require('gopd');
const hasProto = require('has-proto')();
const isTypedArray = require('is-typed-array');
const typedArrays = require('available-typed-arrays')();

// A map to hold getters for byteLength property of each typed array type
const getters = {};

// Define property utility
const oDP = Object.defineProperty;

if (gOPD) {
    const getByteLength = (x) => x.byteLength;

    forEach(typedArrays, (typedArray) => {
        const globalTypedArray = global[typedArray];
        if (typeof globalTypedArray === 'function' || typeof globalTypedArray === 'object') {
            const Proto = globalTypedArray.prototype;
            let descriptor = gOPD(Proto, 'byteLength');

            if (!descriptor && hasProto) {
                const superProto = Proto.__proto__;
                descriptor = gOPD(superProto, 'byteLength');
            }

            if (descriptor?.get) {
                getters[typedArray] = callBind(descriptor.get);
            } else if (oDP) {
                const arr = new globalTypedArray(2);
                descriptor = gOPD(arr, 'byteLength');
                if (descriptor?.configurable) {
                    oDP(arr, 'length', { value: 3 });
                }
                if (arr.length === 2) {
                    getters[typedArray] = getByteLength;
                }
            }
        }
    });
}

const tryTypedArrays = (value) => {
    let foundByteLength;
    forEach(getters, (getter) => {
        if (typeof foundByteLength !== 'number') {
            try {
                const byteLength = getter(value);
                if (typeof byteLength === 'number') {
                    foundByteLength = byteLength;
                }
            } catch (e) {}
        }
    });
    return foundByteLength;
};

module.exports = function typedArrayByteLength(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
