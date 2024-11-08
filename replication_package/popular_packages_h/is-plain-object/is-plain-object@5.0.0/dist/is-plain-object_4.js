'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Checks if the given value is an object.
 * @param {*} value - The value to check.
 * @returns {boolean} - True if value is an object, false otherwise.
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Determines if a given object is a plain object, created by `{}` or `new Object`.
 * @param {*} value - The value to check.
 * @returns {boolean} - True if value is a plain object, false otherwise.
 */
function isPlainObject(value) {
  if (!isObject(value)) return false;

  const ctor = value.constructor;
  if (ctor === undefined) return true;

  const proto = ctor.prototype;
  if (!isObject(proto)) return false;

  if (!proto.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  return true;
}

exports.isPlainObject = isPlainObject;
