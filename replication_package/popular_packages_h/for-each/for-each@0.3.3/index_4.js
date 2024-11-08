'use strict';

const isCallable = require('is-callable');

const toStr = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const iterateArray = (array, iterator, receiver) => {
  array.forEach((item, index) => {
    const context = receiver || undefined;
    iterator.call(context, item, index, array);
  });
};

const iterateString = (string, iterator, receiver) => {
  [...string].forEach((char, index) => {
    const context = receiver || undefined;
    iterator.call(context, char, index, string);
  });
};

const iterateObject = (object, iterator, receiver) => {
  Object.keys(object).forEach(key => {
    if (hasOwnProperty.call(object, key)) {
      const context = receiver || undefined;
      iterator.call(context, object[key], key, object);
    }
  });
};

const forEach = (list, iterator, thisArg) => {
  if (!isCallable(iterator)) {
    throw new TypeError('iterator must be a function');
  }
  const receiver = thisArg ?? undefined;

  if (Array.isArray(list)) {
    iterateArray(list, iterator, receiver);
  } else if (typeof list === 'string') {
    iterateString(list, iterator, receiver);
  } else {
    iterateObject(list, iterator, receiver);
  }
};

module.exports = forEach;
