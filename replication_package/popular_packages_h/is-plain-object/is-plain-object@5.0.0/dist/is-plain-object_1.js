'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isPlainObject(obj) {
  let constructor, prototype;

  if (!isObject(obj)) return false;

  constructor = obj.constructor;
  if (constructor === undefined) return true;

  prototype = constructor.prototype;
  if (!isObject(prototype)) return false;

  if (!prototype.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  return true;
}

exports.isPlainObject = isPlainObject;
