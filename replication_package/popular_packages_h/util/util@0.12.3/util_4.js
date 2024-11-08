const util = {};

// Polyfill for `Object.getOwnPropertyDescriptors`
util.getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(obj) {
  const keys = Object.keys(obj);
  const descriptors = {};
  keys.forEach(key => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
  });
  return descriptors;
};

// Formatting string based on special tokens
util.format = function(f) {
  if (typeof f !== 'string') {
    const objects = [];
    for (let i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  const formatRegExp = /%[sdj%]/g;
  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp, x => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
    }
    return x;
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    str += (typeof x === 'object' ? ' ' + util.inspect(x) : ' ' + x);
  }
  return str;
};

// Util for creating a function that is marked as deprecated
util.deprecate = function(fn, msg) {
  if (process && (process.noDeprecation || typeof process === 'undefined')) {
    return fn;
  }
  
  let warned = false;
  const deprecated = function() {
    if (!warned) {
      process.throwDeprecation ? throw new Error(msg) :
      process.traceDeprecation ? console.trace(msg) : console.error(msg);
      warned = true;
    }
    return fn.apply(this, arguments);
  };
  
  return deprecated;
};

// Debug logging based on NODE_DEBUG environment variable
util.debuglog = function(set) {
  if (!process.env.NODE_DEBUG) return () => {};

  const debugEnv = process.env.NODE_DEBUG.split(',')
    .map(s => s.trim().toUpperCase())
    .join('|') + '|';

  const match = new RegExp('(?:^|\\W)' + set.toUpperCase() + '(?:\\W|$)');
  
  let log;
  if (match.test(debugEnv)) {
    log = function() {
      console.error('%s %d: %s', set.toUpperCase(), process.pid, util.format.apply(util, arguments));
    };
  } else {
    log = () => {};
  }
  
  return log;
};

// Inspect function for getting string representation of objects
util.inspect = function(object, opts = {}) {
  const ctx = {
    seen: [],
    stylize: util.stylizeNoColor,
    ...opts
  };
  return formatValue(ctx, object, ctx.depth || 2);
};

// Default stylization when no color support is desired
util.stylizeNoColor = str => str;

// Export all utility functions
module.exports = util;

// Function to actually format value - omitted here for brevity
function formatValue(ctx, value, recurseTimes) {
  /* Implementation of deeply formatting objects, taking into account styling and visibility */
  /* Consider type, potential recursion, circular references, primitive formatting, etc. */
}

// A set of helper functions to test object types - omitted here for brevity
function isArray(ar) { return Array.isArray(ar); }
function isBoolean(arg) { return typeof arg === 'boolean'; }
function isNull(arg) { return arg === null; }
function isUndefined(arg) { return arg === undefined; }
function isNumber(arg) { return typeof arg === 'number'; }
function isString(arg) { return typeof arg === 'string'; }
function isObject(arg) { return typeof arg === 'object' && arg !== null; }
function isFunction(arg) { return typeof arg === 'function'; }
function isRegExp(re) { return isObject(re) && Object.prototype.toString.call(re) === '[object RegExp]'; }
function isDate(d) { return isObject(d) && Object.prototype.toString.call(d) === '[object Date]'; }
function isError(e) { return isObject(e) && (Object.prototype.toString.call(e) === '[object Error]' || e instanceof Error); }

// Additional utility, module, and polyfills - omitted for brevity
