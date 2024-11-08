const util = require('util');
const process = require('process');

// Polyfill for getOwnPropertyDescriptors if not natively available
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(obj) {
  return Object.keys(obj).reduce((descriptors, key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
    return descriptors;
  }, {});
};

// Format function for strings with placeholders
exports.format = function(f, ...args) {
  if (typeof f !== 'string') {
    return args.map(arg => util.inspect(arg)).join(' ');
  }

  let i = 0;
  const str = f.replace(/%[sdj%]/g, match => {
    if (match === '%%') return '%';
    if (i >= args.length) return match;
    switch (match) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default: return match;
    }
  });
  return str;
};

// Deprecate a function
exports.deprecate = (fn, msg) => {
  if (process.noDeprecation) return fn;
  let warned = false;
  return function(...args) {
    if (!warned) {
      warned = true;
      if (process.throwDeprecation) throw new Error(msg);
      else if (process.traceDeprecation) console.trace(msg);
      else console.error(msg);
    }
    return fn.apply(this, args);
  };
};

// Debug log function for specific debug environments
exports.debuglog = (set) => {
  set = set.toUpperCase();
  if (!process.env.NODE_DEBUG) return () => {};
  
  const debugEnvRegex = new RegExp(`^${process.env.NODE_DEBUG.replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replace(/\*/g, '.*').replace(/,/g, '$|^').toUpperCase()}$`, 'i');
  return debugEnvRegex.test(set)
    ? (...args) => console.error(`${set} ${process.pid}: ${exports.format(...args)}`)
    : () => {};
};

// Object inspection function
exports.inspect = util.inspect;

// Log message with timestamp
exports.log = (...args) => {
  console.log(`${new Date().toISOString()} - ${exports.format(...args)}`);
};

// Inheritance utility
exports.inherits = util.inherits;

// Extend function to copy properties
exports._extend = (origin, add) => {
  if (!add || typeof add !== 'object') return origin;
  return Object.keys(add).reduce((origin, key) => {
    origin[key] = add[key];
    return origin;
  }, origin);
};

// Promisify callback functions
exports.promisify = util.promisify;

// Callbackify promise functions
exports.callbackify = util.callbackify;
