'use strict';

const forEach = require('foreach');
const availableTypedArrays = require('available-typed-arrays');
const callBound = require('call-bind/callBound');

const $toString = callBound('Object.prototype.toString');
const hasSymbols = require('has-symbols')();
const hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

const typedArrays = availableTypedArrays();

const $slice = callBound('String.prototype.slice');
const toStrTags = {};
const gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
const getPrototypeOf = Object.getPrototypeOf;

if (hasToStringTag && gOPD && getPrototypeOf) {
    forEach(typedArrays, (typedArray) => {
        if (typeof global[typedArray] === 'function') {
            const arr = new global[typedArray]();
            if (!(Symbol.toStringTag in arr)) {
                throw new EvalError(`this engine has support for Symbol.toStringTag, but ${typedArray} does not have the property! Please report this.`);
            }
            const proto = getPrototypeOf(arr);
            let descriptor = gOPD(proto, Symbol.toStringTag) || gOPD(getPrototypeOf(proto), Symbol.toStringTag);
            toStrTags[typedArray] = descriptor.get;
        }
    });
}

const tryTypedArrays = (value) => {
    let foundName = false;
    forEach(toStrTags, (getter, typedArray) => {
        if (!foundName) {
            try {
                const name = getter.call(value);
                if (name === typedArray) {
                    foundName = name;
                }
            } catch (e) {}
        }
    });
    return foundName;
};

const isTypedArray = require('is-typed-array');

module.exports = function whichTypedArray(value) {
    if (!isTypedArray(value)) return false;
    if (!hasToStringTag) return $slice($toString(value), 8, -1);
    return tryTypedArrays(value);
};
