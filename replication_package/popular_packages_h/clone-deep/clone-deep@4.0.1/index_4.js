'use strict';

/**
 * Module dependencies
 */

const shallowClone = require('shallow-clone');
const identifyType = require('kind-of');
const checkPlainObject = require('is-plain-object');

/**
 * Deeply clones a value. If a custom instance cloning function is provided, it can override the cloning of objects.
 * @param {any} value - The value to be deeply cloned.
 * @param {Function} [instanceClone] - Optional function to handle cloning of object instances.
 * @returns {any} - The deep-cloned value.
 */
function deepClone(value, instanceClone) {
  const valueType = identifyType(value);

  if (valueType === 'object') {
    return deepCloneObject(value, instanceClone);
  }

  if (valueType === 'array') {
    return deepCloneArray(value, instanceClone);
  }

  return shallowClone(value);
}

/**
 * Deeply clones an object. Uses optional instanceClone function if provided.
 * @param {Object} obj - The object to be deeply cloned.
 * @param {Function} instanceClone - Optional function for cloning object instances.
 * @returns {Object} - The cloned object.
 */
function deepCloneObject(obj, instanceClone) {
  if (typeof instanceClone === 'function') {
    return instanceClone(obj);
  }

  if (instanceClone || checkPlainObject(obj)) {
    const result = new obj.constructor();

    for (const key in obj) {
      result[key] = deepClone(obj[key], instanceClone);
    }

    return result;
  }

  return obj;
}

/**
 * Deeply clones an array.
 * @param {Array} array - The array to be deeply cloned.
 * @param {Function} instanceClone - Optional function for cloning object instances.
 * @returns {Array} - The cloned array.
 */
function deepCloneArray(array, instanceClone) {
  const result = new array.constructor(array.length);

  for (let i = 0; i < array.length; i++) {
    result[i] = deepClone(array[i], instanceClone);
  }

  return result;
}

/**
 * Expose `deepClone`
 */

module.exports = deepClone;
