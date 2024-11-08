'use strict';

module.exports = function getType(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  const basicType = typeof val;
  switch (basicType) {
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'symbol':
      return 'symbol';
    case 'function':
      return isGenerator(val) ? 'generatorfunction' : 'function';
    case 'object':
      break; // Further checks for objects
    default:
      return 'unknown';
  }

  if (Array.isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';

  const objectType = Object.prototype.toString.call(val);
  switch (objectType) {
    case '[object Date]':
      return 'date';
    case '[object RegExp]':
      return 'regexp';
    case '[object Error]':
      return 'error';
    case '[object Promise]':
      return 'promise';
    case '[object Set]':
      return 'set';
    case '[object WeakSet]':
      return 'weakset';
    case '[object Map]':
      return 'map';
    case '[object WeakMap]':
      return 'weakmap';
    case '[object Int8Array]':
      return 'int8array';
    case '[object Uint8Array]':
      return 'uint8array';
    case '[object Uint8ClampedArray]':
      return 'uint8clampedarray';
    case '[object Int16Array]':
      return 'int16array';
    case '[object Uint16Array]':
      return 'uint16array';
    case '[object Int32Array]':
      return 'int32array';
    case '[object Uint32Array]':
      return 'uint32array';
    case '[object Float32Array]':
      return 'float32array';
    case '[object Float64Array]':
      return 'float64array';
    default:
      return objectType.slice(8, -1).toLowerCase();
  }
};

function isGenerator(val) {
  return typeof val === 'function' && val.constructor && val.constructor.name === 'GeneratorFunction';
}

function isArguments(val) {
  return typeof val === 'object' && val !== null &&
    Object.prototype.toString.call(val) === '[object Arguments]';
}

function isBuffer(val) {
  return typeof val === 'object' && val !== null &&
    typeof val.readUInt8 === 'function' && typeof val.slice === 'function' &&
    val.buffer instanceof ArrayBuffer;
}
