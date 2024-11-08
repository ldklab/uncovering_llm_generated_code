'use strict';

/**
 * Module dependencies
 */

const shallowClone = require('shallow-clone');
const getType = require('kind-of');
const isSimpleObject = require('is-plain-object');

function deepClone(value, customClone) {
  const valueType = getType(value);
  switch (valueType) {
    case 'object':
      return deepCloneObject(value, customClone);
    case 'array':
      return deepCloneArray(value, customClone);
    default:
      return shallowClone(value);
  }
}

function deepCloneObject(obj, customClone) {
  if (typeof customClone === 'function') {
    return customClone(obj);
  }
  if (customClone || isSimpleObject(obj)) {
    const result = new obj.constructor();
    for (const key in obj) {
      result[key] = deepClone(obj[key], customClone);
    }
    return result;
  }
  return obj;
}

function deepCloneArray(arr, customClone) {
  const result = new arr.constructor(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = deepClone(arr[i], customClone);
  }
  return result;
}

/**
 * Expose `deepClone`
 */

module.exports = deepClone;
