'use strict';

const forEach = require('for-each');
const availableTypedArrays = require('available-typed-arrays');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const gOPD = require('gopd');

const $toString = callBound('Object.prototype.toString');
const hasToStringTag = require('has-tostringtag/shams')();

const globalScope = typeof globalThis === 'undefined' ? global : globalThis;
const typedArrayNames = availableTypedArrays();

const $slice = callBound('String.prototype.slice');
const getPrototypeOf = Object.getPrototypeOf;

const $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) return i;
    }
    return -1;
};

let cache = { __proto__: null };
if (hasToStringTag && gOPD && getPrototypeOf) {
    forEach(typedArrayNames, (name) => {
        const instance = new globalScope[name]();
        if (Symbol.toStringTag in instance) {
            const proto = getPrototypeOf(instance);
            let descriptor = gOPD(proto, Symbol.toStringTag) || gOPD(getPrototypeOf(proto), Symbol.toStringTag);
            if (descriptor) {
                cache['$' + name] = callBind(descriptor.get);
            }
        }
    });
} else {
    forEach(typedArrayNames, (name) => {
        const instance = new globalScope[name]();
        const method = instance.slice || instance.set;
        if (method) {
            cache['$' + name] = callBind(method);
        }
    });
}

function tryTypedArrays(value) {
    let result = false;
    forEach(cache, (getter, typedArray) => {
        if (!result) {
            try {
                if ('$' + getter(value) === typedArray) {
                    result = $slice(typedArray, 1);
                }
            } catch (e) {}
        }
    });
    return result;
}

function trySlices(value) {
    let result = false;
    forEach(cache, (getter, name) => {
        if (!result) {
            try {
                getter(value);
                result = $slice(name, 1);
            } catch (e) {}
        }
    });
    return result;
}

module.exports = function whichTypedArray(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    if (!hasToStringTag) {
        const tag = $slice($toString(value), 8, -1);
        if ($indexOf(typedArrayNames, tag) > -1) {
            return tag;
        }
        if (tag !== 'Object') {
            return false;
        }
        return trySlices(value);
    }
    if (!gOPD) {
        return null;
    }
    return tryTypedArrays(value);
};
