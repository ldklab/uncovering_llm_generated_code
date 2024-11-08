'use strict';

module.exports = function detectType(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const valueType = typeof value;
  if (valueType === 'boolean') return 'boolean';
  if (valueType === 'string') return 'string';
  if (valueType === 'number') return 'number';
  if (valueType === 'symbol') return 'symbol';
  if (valueType === 'function') return isGenFunction(value) ? 'generatorfunction' : 'function';

  if (Array.isArray(value)) return 'array';
  if (checkBuffer(value)) return 'buffer';
  if (checkArguments(value)) return 'arguments';

  const objectTag = Object.prototype.toString.call(value);
  switch (objectTag) {
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
    default: return objectTag.slice(8, -1).toLowerCase();
  }
};

function isGenFunction(func) {
  return typeof func === 'function' && func.constructor && func.constructor.name === 'GeneratorFunction';
}

function checkArguments(arg) {
  return arg && typeof arg === 'object' && typeof arg.length === 'number' && 
    Object.prototype.toString.call(arg) === '[object Arguments]';
}

function checkBuffer(buffer) {
  return buffer && typeof buffer === 'object' && typeof buffer.readUInt8 === 'function' &&
    typeof buffer.slice === 'function' && buffer.buffer instanceof ArrayBuffer;
}
