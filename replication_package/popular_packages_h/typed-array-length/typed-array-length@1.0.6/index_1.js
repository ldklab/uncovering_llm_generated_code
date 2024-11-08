'use strict';

const callBind = require('call-bind');
const forEach = require('for-each');
const gOPD = require('gopd');
const hasProto = require('has-proto')();
const isTypedArray = require('is-typed-array');
const typedArrayNames = require('possible-typed-array-names');

/** @typedef {(value: *) => number} TypedArrayLengthGetter */
/** @typedef {{ [k: string]: TypedArrayLengthGetter|null }} Cache */

const getters = Object.create(null);
const defineProperty = Object.defineProperty;

if (gOPD) {
    const getLength = function (x) { return x.length; };

    forEach(typedArrayNames, function (typedArrayName) {
        const TypedArrayConstructor = global[typedArrayName];

        if (typeof TypedArrayConstructor === 'function' || typeof TypedArrayConstructor === 'object') {
            const Proto = TypedArrayConstructor.prototype;
            let descriptor = gOPD(Proto, 'length');

            if (!descriptor && hasProto) {
                const superProto = Object.getPrototypeOf(Proto);
                descriptor = gOPD(superProto, 'length');
            }

            if (descriptor && descriptor.get) {
                getters['$' + typedArrayName] = callBind(descriptor.get);
            } else if (defineProperty) {
                const instance = new TypedArrayConstructor(2);
                descriptor = gOPD(instance, 'length');
                if (descriptor && descriptor.configurable) {
                    defineProperty(instance, 'length', { value: 3 });
                }
                if (instance.length === 2) {
                    getters['$' + typedArrayName] = getLength;
                }
            }
        }
    });
}

const tryTypedArrays = function (value) {
    let foundLength;

    forEach(getters, function (getter) {
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

module.exports = function typedArrayLength(value) {
    if (!isTypedArray(value)) {
        return false;
    }
    return tryTypedArrays(value);
};
