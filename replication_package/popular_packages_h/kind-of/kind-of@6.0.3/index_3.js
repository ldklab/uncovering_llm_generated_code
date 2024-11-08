var toString = Object.prototype.toString;

module.exports = function kindOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  let type = typeof val;
  switch (type) {
    case 'boolean': 
    case 'string': 
    case 'number': 
    case 'symbol': 
      return type;
    case 'function': 
      return isGeneratorFunction(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegExp(val)) return 'regexp';

  switch (getConstructorName(val)) {
    case 'Symbol': return 'symbol';
    case 'Promise': return 'promise';
    case 'WeakMap': return 'weakmap';
    case 'WeakSet': return 'weakset';
    case 'Map': return 'map';
    case 'Set': return 'set';
    case 'Int8Array': return 'int8array';
    case 'Uint8Array': return 'uint8array';
    case 'Uint8ClampedArray': return 'uint8clampedarray';
    case 'Int16Array': return 'int16array';
    case 'Uint16Array': return 'uint16array';
    case 'Int32Array': return 'int32array';
    case 'Uint32Array': return 'uint32array';
    case 'Float32Array': return 'float32array';
    case 'Float64Array': return 'float64array';
  }

  if (isGeneratorObject(val)) return 'generator';

  type = toString.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

function getConstructorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isArray(val) {
  return Array.isArray ? Array.isArray(val) : val instanceof Array;
}

function isError(val) {
  return val instanceof Error || 
         (typeof val.message === 'string' && val.constructor && 
          typeof val.constructor.stackTraceLimit === 'number');
}

function isDate(val) {
  return val instanceof Date || 
         (typeof val.toDateString === 'function' && typeof val.getDate === 'function' && 
          typeof val.setDate === 'function');
}

function isRegExp(val) {
  return val instanceof RegExp || 
         (typeof val.flags === 'string' && typeof val.ignoreCase === 'boolean' && 
          typeof val.multiline === 'boolean' && typeof val.global === 'boolean');
}

function isGeneratorFunction(val) {
  return getConstructorName(val) === 'GeneratorFunction';
}

function isGeneratorObject(val) {
  return typeof val.throw === 'function' && 
         typeof val.return === 'function' && 
         typeof val.next === 'function';
}

function isArguments(val) {
  try {
    return typeof val.length === 'number' && typeof val.callee === 'function';
  } catch (err) {
    return err.message.includes('callee');
  }
}

function isBuffer(val) {
  return val.constructor && typeof val.constructor.isBuffer === 'function' && 
         val.constructor.isBuffer(val);
}
