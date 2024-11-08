'use strict';

const callBind = require('call-bind');
const forEach = require('for-each');
const gOPD = require('gopd');
const hasProto = require('has-proto')();
const isTypedArray = require('is-typed-array');
const typedArrays = require('possible-typed-array-names');

/** @typedef {(value: TypedArray) => number} TypedArrayLengthGetter */
/** @typedef {{ [k in `$${TypedArrayName}` | '__proto__']: k extends '__proto__' ? null : TypedArrayLengthGetter }} Cache */

/** @type {Cache} */
const getters = { __proto__: null };
const oDP = Object.defineProperty;

// If global object property descriptor is retrievable
if (gOPD) {
    const getLength = (x) => x.length;
    
    forEach(typedArrays, (typedArrayName) => {
        const TypedArrayConstructor = global[typedArrayName];
        
        if (typeof TypedArrayConstructor === 'function' || typeof TypedArrayConstructor === 'object') {
            const Proto = TypedArrayConstructor.prototype;
            let descriptor = gOPD(Proto, 'length');
            
            if (!descriptor && hasProto) {
                const superProto = Proto.__proto__;
                descriptor = gOPD(superProto, 'length');
            }
            
            if (descriptor && descriptor.get) {
                getters[`$${typedArrayName}`] = callBind(descriptor.get);
            } else if (oDP) {
                const instanceArr = new global[typedArrayName](2);
                descriptor = gOPD(instanceArr, 'length');
                if (descriptor && descriptor.configurable) {
                    oDP(instanceArr, 'length', { value: 3 });
                }
                if (instanceArr.length === 2) {
                    getters[`$${typedArrayName}`] = getLength;
                }
            }
        }
    });
}

/** @type {TypedArrayLengthGetter} */
const tryTypedArrays = (value) => {
    let foundLength;
    forEach(getters, (getter) => {
        if (typeof foundLength !== 'number') {
            try {
                const length = getter(value);
                if (typeof length === 'number') {
                    foundLength = length;
                }
            } catch (e) {}
        }
    });
    return foundLength;
};

/** @type {import('.')} */
module.exports = function typedArrayLength(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
