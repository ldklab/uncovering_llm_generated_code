'use strict';

module.exports = function kindOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  const type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') return isGeneratorFunction(val) ? 'generatorfunction' : 'function';

  if (Array.isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';

  const typeTag = Object.prototype.toString.call(val);
  switch (typeTag) {
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
    default: return typeTag.slice(8, -1).toLowerCase(); // Fallback for any other object types
  }
};

function isGeneratorFunction(val) {
  return typeof val === 'function' && val.constructor && val.constructor.name === 'GeneratorFunction';
}

function isArguments(val) {
  return val && typeof val === 'object' && typeof val.length === 'number' && 
    Object.prototype.toString.call(val) === '[object Arguments]';
}

function isBuffer(val) {
  return val && typeof val === 'object' && typeof val.readUInt8 === 'function' &&
    typeof val.slice === 'function' && val.buffer instanceof ArrayBuffer;
}
