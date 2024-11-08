var toString = Object.prototype.toString;

module.exports = function kindOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

  switch (ctorName(val)) {
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

  if (isGeneratorObj(val)) {
    return 'generator';
  }

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

function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isArray(val) {
  return Array.isArray(val);
}

function isError(val) {
  return val instanceof Error || ('string' === typeof val.message && val.constructor && 'number' === typeof val.constructor.stackTraceLimit);
}

function isDate(val) {
  return val instanceof Date || ('function' === typeof val.toDateString && 'function' === typeof val.getDate && 'function' === typeof val.setDate);
}

function isRegexp(val) {
  return val instanceof RegExp || ('string' === typeof val.flags && 'boolean' === typeof val.ignoreCase && 'boolean' === typeof val.multiline && 'boolean' === typeof val.global);
}

function isGeneratorFn(val) {
  return ctorName(val) === 'GeneratorFunction';
}

function isGeneratorObj(val) {
  return 'function' === typeof val.throw && 'function' === typeof val.return && 'function' === typeof val.next;
}

function isArguments(val) {
  try {
    if ('number' === typeof val.length && 'function' === typeof val.callee) {
      return true;
    }
  } catch (err) {
    if (err.message.includes('callee')) {
      return true;
    }
  }
  return false;
}

function isBuffer(val) {
  return val.constructor && 'function' === typeof val.constructor.isBuffer && val.constructor.isBuffer(val);
}
