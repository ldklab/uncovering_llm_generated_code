'use strict';

const forEach = require('foreach');
const availableTypedArrays = require('available-typed-arrays');
const callBound = require('call-bind/callBound');
const hasSymbols = require('has-symbols')();
const isTypedArray = require('is-typed-array');
const getOwnPropertyDescriptor = require('es-abstract/helpers/getOwnPropertyDescriptor');
const getPrototypeOf = Object.getPrototypeOf;

const $toString = callBound('Object.prototype.toString');
const $slice = callBound('String.prototype.slice');
const hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

const typedArrays = availableTypedArrays();
const toStrTags = {};

if (hasToStringTag && getOwnPropertyDescriptor && getPrototypeOf) {
    forEach(typedArrays, (typedArray) => {
        const TypedArrayConstructor = global[typedArray];
        if (typeof TypedArrayConstructor === 'function') {
            const instance = new TypedArrayConstructor();
            if (!(Symbol.toStringTag in instance)) {
                throw new EvalError(`Expected Symbol.toStringTag in ${typedArray}`);
            }
            let descriptor = getOwnPropertyDescriptor(getPrototypeOf(instance), Symbol.toStringTag);
            if (!descriptor) {
                descriptor = getOwnPropertyDescriptor(getPrototypeOf(getPrototypeOf(instance)), Symbol.toStringTag);
            }
            if (descriptor) {
                toStrTags[typedArray] = descriptor.get;
            }
        }
    });
}

function tryTypedArrays(value) {
    let foundName = false;
    forEach(toStrTags, (getter, typedArrayName) => {
        if (!foundName) {
            try {
                const name = getter.call(value);
                if (name === typedArrayName) {
                    foundName = name;
                }
            } catch (e) {}
        }
    });
    return foundName;
}

module.exports = function whichTypedArray(value) {
    if (!isTypedArray(value)) return false;
    return hasToStringTag ? tryTypedArrays(value) : $slice($toString(value), 8, -1);
};
