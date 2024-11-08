'use strict';

function kindOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  const type = typeof val;
  switch (type) {
    case 'boolean': return 'boolean';
    case 'string': return 'string';
    case 'number': return 'number';
    case 'symbol': return 'symbol';
    case 'function': return isGeneratorFunction(val) ? 'generatorfunction' : 'function';
  }

  if (Array.isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';

  const typeTag = Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  switch (typeTag) {
    case 'date': return 'date';
    case 'regexp': return 'regexp';
    case 'error': return 'error';
    case 'promise': return 'promise';
    case 'set': return 'set';
    case 'weakset': return 'weakset';
    case 'map': return 'map';
    case 'weakmap': return 'weakmap';
    case 'int8array': return 'int8array';
    case 'uint8array': return 'uint8array';
    case 'uint8clampedarray': return 'uint8clampedarray';
    case 'int16array': return 'int16array';
    case 'uint16array': return 'uint16array';
    case 'int32array': return 'int32array';
    case 'uint32array': return 'uint32array';
    case 'float32array': return 'float32array';
    case 'float64array': return 'float64array';
    default: return typeTag;
  }
}

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

module.exports = kindOf;
