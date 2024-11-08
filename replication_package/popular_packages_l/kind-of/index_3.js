'use strict';

module.exports = function determineType(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const primitiveType = typeof value;
  if (primitiveType === 'boolean') return 'boolean';
  if (primitiveType === 'string') return 'string';
  if (primitiveType === 'number') return 'number';
  if (primitiveType === 'symbol') return 'symbol';
  if (primitiveType === 'function') return isGeneratorFunc(value) ? 'generatorfunction' : 'function';

  if (Array.isArray(value)) return 'array';
  if (isBufferType(value)) return 'buffer';
  if (isArgumentList(value)) return 'arguments';

  const objectTypeTag = Object.prototype.toString.call(value);
  switch (objectTypeTag) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Error]': return 'error';
    case '[object Promise]': return 'promise';
    case '[object Set]': return 'set';
    case '[object WeakSet]': return 'weakset';
    case '[object Map]': return 'map';
    case '[object WeakMap]': return 'weakmap';
    case '[object Int8Array]': return 'int8array';
    case '[object Uint8Array]': return 'uint8array';
    case '[object Uint8ClampedArray]': return 'uint8clampedarray';
    case '[object Int16Array]': return 'int16array';
    case '[object Uint16Array]': return 'uint16array';
    case '[object Int32Array]': return 'int32array';
    case '[object Uint32Array]': return 'uint32array';
    case '[object Float32Array]': return 'float32array';
    case '[object Float64Array]': return 'float64array';
    default: return objectTypeTag.slice(8, -1).toLowerCase();
  }
};

function isGeneratorFunc(func) {
  return typeof func === 'function' && func.constructor && func.constructor.name === 'GeneratorFunction';
}

function isArgumentList(obj) {
  return obj && typeof obj === 'object' && typeof obj.length === 'number' && 
    Object.prototype.toString.call(obj) === '[object Arguments]';
}

function isBufferType(obj) {
  return obj && typeof obj === 'object' && typeof obj.readUInt8 === 'function' &&
    typeof obj.slice === 'function' && obj.buffer instanceof ArrayBuffer;
}
