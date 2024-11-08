'use strict';

/**
 * Module dependencies
 */

const shallowClone = require('shallow-clone');
const typeOf = require('kind-of');
const isPlainObject = require('is-plain-object');

/**
 * Deeply clones a value, with optional customization for object instances.
 * 
 * @param {*} val - The value to clone.
 * @param {Function} [instanceClone] - Optional function for custom instance cloning.
 * @returns {*} - The deeply cloned value.
 */
function cloneDeep(val, instanceClone) {
  const valType = typeOf(val);
  
  if (valType === 'object') {
    return cloneObjectDeep(val, instanceClone);
  }
  
  if (valType === 'array') {
    return cloneArrayDeep(val, instanceClone);
  }
  
  return shallowClone(val);
}

/**
 * Deeply clones an object.
 * 
 * @param {Object} val - The object to clone.
 * @param {Function} [instanceClone] - Optional function for custom instance cloning.
 * @returns {Object} - The deeply cloned object.
 */
function cloneObjectDeep(val, instanceClone) {
  if (typeof instanceClone === 'function') {
    return instanceClone(val);
  }
  
  if (instanceClone || isPlainObject(val)) {
    const result = new val.constructor();
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        result[key] = cloneDeep(val[key], instanceClone);
      }
    }
    return result;
  }
  
  return val;
}

/**
 * Deeply clones an array.
 * 
 * @param {Array} val - The array to clone.
 * @param {Function} [instanceClone] - Optional function for custom element cloning.
 * @returns {Array} - The deeply cloned array.
 */
function cloneArrayDeep(val, instanceClone) {
  const result = new val.constructor(val.length);
  for (let i = 0; i < val.length; i++) {
    result[i] = cloneDeep(val[i], instanceClone);
  }
  return result;
}

/**
 * Exports the `cloneDeep` function.
 */

module.exports = cloneDeep;
