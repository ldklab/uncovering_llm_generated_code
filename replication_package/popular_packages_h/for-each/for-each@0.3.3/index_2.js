'use strict';

const isCallable = require('is-callable');

const toStr = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const forEachArray = (array, iterator, receiver) => {
    for (let i = 0; i < array.length; i++) {
        if (hasOwnProperty.call(array, i)) {
            receiver == null ? iterator(array[i], i, array) : iterator.call(receiver, array[i], i, array);
        }
    }
};

const forEachString = (string, iterator, receiver) => {
    for (let i = 0; i < string.length; i++) {
        receiver == null ? iterator(string.charAt(i), i, string) : iterator.call(receiver, string.charAt(i), i, string);
    }
};

const forEachObject = (object, iterator, receiver) => {
    for (const k in object) {
        if (hasOwnProperty.call(object, k)) {
            receiver == null ? iterator(object[k], k, object) : iterator.call(receiver, object[k], k, object);
        }
    }
};

const forEach = (list, iterator, thisArg) => {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    const receiver = arguments.length >= 3 ? thisArg : undefined;

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;
