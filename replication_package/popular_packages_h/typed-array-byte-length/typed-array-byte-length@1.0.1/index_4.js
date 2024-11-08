'use strict';

const callBind = require('call-bind');
const forEach = require('for-each');
const gOPD = require('gopd');
const hasProto = require('has-proto')();
const isTypedArray = require('is-typed-array');

const typedArrays = require('available-typed-arrays')();

// Create a map for storing getters for byteLength
const getters = {};

// Define Object.defineProperty shorthand
const oDP = Object.defineProperty;

if (gOPD) {
    const getByteLength = x => x.byteLength;
    forEach(typedArrays, typedArray => {
        if (typeof global[typedArray] === 'function' || typeof global[typedArray] === 'object') {
            const Proto = global[typedArray].prototype;
            let descriptor = gOPD(Proto, 'byteLength');
            
            if (!descriptor && hasProto) {
                const superProto = Proto.__proto__;
                descriptor = gOPD(superProto, 'byteLength');
            }

            if (descriptor && descriptor.get) {
                getters[typedArray] = callBind(descriptor.get);
            } else if (oDP) {
                const arr = new global[typedArray](2);
                descriptor = gOPD(arr, 'byteLength');
                if (descriptor && descriptor.configurable) {
                    oDP(arr, 'length', { value: 3 });
                }
                if (arr.length === 2) {
                    getters[typedArray] = getByteLength;
                }
            }
        }
    });
}

const tryTypedArrays = function(value) {
    let foundByteLength;
    forEach(getters, getter => {
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
