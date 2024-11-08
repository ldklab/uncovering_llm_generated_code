'use strict';

/**
 * Module dependencies
 */

const shallowClone = require('shallow-clone');
const getType = require('kind-of');
const isObject = require('is-plain-object');

function deepClone(value, customInstanceClone) {
  switch (getType(value)) {
    case 'object':
      return deepCloneObject(value, customInstanceClone);
    case 'array':
      return deepCloneArray(value, customInstanceClone);
    default:
      return shallowClone(value);
  }
}

function deepCloneObject(value, customInstanceClone) {
  if (typeof customInstanceClone === 'function') {
    return customInstanceClone(value);
  }
  
  if (customInstanceClone || isObject(value)) {
    const result = new value.constructor();
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = deepClone(value[key], customInstanceClone);
      }
    }
    return result;
  }
  
  return value;
}

function deepCloneArray(value, customInstanceClone) {
  const result = new value.constructor(value.length);
  for (let i = 0; i < value.length; i++) {
    result[i] = deepClone(value[i], customInstanceClone);
  }
  return result;
}

/**
 * Export `deepClone`
 */

module.exports = deepClone;
