'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Check if a value is an object.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is an object; otherwise false.
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Check if an object is a plain object.
 * A plain object is created by the Object constructor or with object literal syntax and does not have any modified prototypes or constructors.
 *
 * @param {any} obj - The object to check.
 * @returns {boolean} - True if the object is a plain object; otherwise false.
 */
function isPlainObject(obj) {
  if (!isObject(obj)) return false;

  const ctor = obj.constructor;
  if (ctor === undefined) return true;

  const prototype = ctor.prototype;
  if (!isObject(prototype)) return false;

  return prototype.hasOwnProperty('isPrototypeOf') !== false;
}

exports.isPlainObject = isPlainObject;
