'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  if (!isObject(o)) return false;

  const ctor = o.constructor;
  if (ctor === undefined) return true;

  const prot = ctor.prototype;
  return isObject(prot) && prot.hasOwnProperty('isPrototypeOf');
}

exports.isPlainObject = isPlainObject;
