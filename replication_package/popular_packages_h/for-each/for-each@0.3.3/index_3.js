'use strict';

const isCallable = require('is-callable');

const forEachArray = (array, iterator, receiver) => {
    array.forEach((item, index) => {
        hasOwnProperty.call(array, index) &&
        (receiver == null ? iterator(item, index, array) : iterator.call(receiver, item, index, array));
    });
};

const forEachString = (string, iterator, receiver) => {
    [...string].forEach((char, index) => {
        receiver == null ? iterator(char, index, string) : iterator.call(receiver, char, index, string);
    });
};

const forEachObject = (object, iterator, receiver) => {
    for (let key in object) {
        if (hasOwnProperty.call(object, key)) {
            receiver == null ? iterator(object[key], key, object) : iterator.call(receiver, object[key], key, object);
        }
    }
};

const forEach = (list, iterator, thisArg) => {
    if (!isCallable(iterator)) throw new TypeError('iterator must be a function');

    const receiver = arguments.length >= 3 ? thisArg : undefined;

    const toStr = (val) => Object.prototype.toString.call(val);
    const hasOwnProperty = Object.prototype.hasOwnProperty;

    if (toStr(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;
