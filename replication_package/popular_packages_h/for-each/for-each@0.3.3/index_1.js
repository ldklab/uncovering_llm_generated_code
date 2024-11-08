'use strict';

const isCallable = require('is-callable');

const toStringTag = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const iterateArray = (arr, callback, context) => {
    for (let i = 0, len = arr.length; i < len; i++) {
        if (hasOwnProperty.call(arr, i)) {
            if (context == null) {
                callback(arr[i], i, arr);
            } else {
                callback.call(context, arr[i], i, arr);
            }
        }
    }
};

const iterateString = (str, callback, context) => {
    for (let i = 0, len = str.length; i < len; i++) {
        if (context == null) {
            callback(str.charAt(i), i, str);
        } else {
            callback.call(context, str.charAt(i), i, str);
        }
    }
};

const iterateObject = (obj, callback, context) => {
    for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            if (context == null) {
                callback(obj[key], key, obj);
            } else {
                callback.call(context, obj[key], key, obj);
            }
        }
    }
};

const customForEach = (collection, callback, context) => {
    if (!isCallable(callback)) {
        throw new TypeError('callback must be a function');
    }

    if (arguments.length >= 3) {
        context = context;
    }

    if (toStringTag.call(collection) === '[object Array]') {
        iterateArray(collection, callback, context);
    } else if (typeof collection === 'string') {
        iterateString(collection, callback, context);
    } else {
        iterateObject(collection, callback, context);
    }
};

module.exports = customForEach;
