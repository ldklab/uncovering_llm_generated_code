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
const getters = Object.create(null);

const oDP = Object.defineProperty;

if (gOPD) {
    const getLength = (x) => x.length;

    forEach(typedArrays, (typedArray) => {
        const TypedArrayConstructor = global[typedArray];

        if (typeof TypedArrayConstructor === 'function' || typeof TypedArrayConstructor === 'object') {
            let Proto = TypedArrayConstructor.prototype;
            let descriptor = gOPD(Proto, 'length');

            if (!descriptor && hasProto) {
                Proto = Object.getPrototypeOf(Proto);
                descriptor = gOPD(Proto, 'length');
            }

            if (descriptor && descriptor.get) {
                getters[`$${typedArray}`] = callBind(descriptor.get);
            } else if (oDP) {
                const instance = new global[typedArray](2);
                descriptor = gOPD(instance, 'length');

                if (descriptor && descriptor.configurable) {
                    oDP(instance, 'length', { value: 3 });
                }

                if (instance.length === 2) {
                    getters[`$${typedArray}`] = getLength;
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
            } catch (error) {}
        }
    });

    return foundLength;
};

module.exports = (value) => {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
