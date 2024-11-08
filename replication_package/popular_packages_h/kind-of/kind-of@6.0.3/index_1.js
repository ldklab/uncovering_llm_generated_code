// Utility function to check types based on Object.prototype.toString
var toString = Object.prototype.toString;

// Exported function to determine the kind of value
module.exports = function kindOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFunction(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

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

  if (isGeneratorObject(val)) {
    return 'generator';
  }

  // Handle non-plain objects using Object.prototype.toString
  type = toString.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  // Return formatted type for other objects
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

// Helper function to get the constructor name of a value
function getConstructorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

// Helper to check if value is an array
function isArray(val) {
  return Array.isArray(val);
}

// Helper to check if value is an Error
function isError(val) {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

// Helper to check if value is a Date
function isDate(val) {
  return val instanceof Date || (typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function');
}

// Helper to check if value is a RegExp
function isRegexp(val) {
  return val instanceof RegExp || (typeof val.flags === 'string' && typeof val.ignoreCase === 'boolean' && typeof val.multiline === 'boolean' && typeof val.global === 'boolean');
}

// Helper to check if value is a generator function
function isGeneratorFunction(val) {
  return getConstructorName(val) === 'GeneratorFunction';
}

// Helper to check if value is a generator object
function isGeneratorObject(val) {
  return typeof val.throw === 'function' && typeof val.return === 'function' && typeof val.next === 'function';
}

// Helper to check if value is an arguments object
function isArguments(val) {
  try {
    return typeof val.length === 'number' && typeof val.callee === 'function';
  } catch (err) {
    return err.message.indexOf('callee') !== -1;
  }
}

// Compatibility note for older browsers
function isBuffer(val) {
  return val.constructor && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}
