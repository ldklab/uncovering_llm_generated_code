'use strict';

const forEach = require('for-each');
const callBind = require('call-bind');
const typedArrays = require('available-typed-arrays')();
const hasProto = require('has-proto')();
const gOPD = require('gopd');
const isTypedArray = require('is-typed-array');

const getters = {};
const oDP = Object.defineProperty;

if (gOPD) {
    const getByteOffset = (x) => x.byteOffset;
    forEach(typedArrays, (typedArray) => {
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

const tryTypedArrays = (value) => {
    let foundOffset;
    forEach(getters, (getter) => {
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

module.exports = function typedArrayByteOffset(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
