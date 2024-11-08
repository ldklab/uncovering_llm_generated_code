// Utility functions module for Node.js

const { types } = require('./support/types');
const { isBuffer } = require('./support/isBuffer');
const inherits = require('inherits');

// Utility to get property descriptors
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(obj) {
  const keys = Object.keys(obj);
  const descriptors = {};
  for (let i = 0; i < keys.length; i++) {
    descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
  }
  return descriptors;
};

// String formatting function
const formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    const objects = [];
    for (let i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp, function(x) {
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
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

// Deprecation utility
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  let warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};

// Debug log utility
const debugs = {};
let debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  let debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      const pid = process.pid;
      debugs[set] = function() {
        const msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};

// Inspect utility for objects
function inspect(obj, opts) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor,
  };
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    exports._extend(ctx, opts);
  }
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;
inspect.colors = {
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  white: [37, 39],
  grey: [90, 39],
  black: [30, 39],
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39],
};
inspect.styles = {
  special: 'cyan',
  number: 'yellow',
  boolean: 'yellow',
  undefined: 'grey',
  null: 'bold',
  string: 'green',
  date: 'magenta',
  regexp: 'red',
};

// Stylize strings with color
function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];
  if (style) {
    return `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m`;
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  const hash = {};
  array.forEach(val => hash[val] = true);
  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) &&
     value.inspect !== exports.inspect &&
     !(value.constructor && value.constructor.prototype === value)) {
    let ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  const primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  let keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  if (isError(value) && (keys.includes('message') || keys.includes('description'))) {
    return formatError(value);
  }

  if (keys.length === 0) {
    if (isFunction(value)) {
      const name = value.name ? `: ${value.name}` : '';
      return ctx.stylize(`[Function${name}]`, 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  let base = '', array = false, braces = ['{', '}'];

  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  if (isFunction(value)) {
    const n = value.name ? `: ${value.name}` : '';
    base = ` [Function${n}]`;
  }

  if (isRegExp(value)) {
    base = ` ${RegExp.prototype.toString.call(value)}`;
  }

  if (isDate(value)) {
    base = ` ${Date.prototype.toUTCString.call(value)}`;
  }

  if (isError(value)) {
    base = ` ${formatError(value)}`;
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return `${braces[0]}${base}${braces[1]}`;
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  let output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(key => formatProperty(ctx, value, recurseTimes, visibleKeys, key, array));
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    const simple = `'${JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"')}'`;
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize(`${value}`, 'number');
  if (isBoolean(value)) return ctx.stylize(`${value}`, 'boolean');
  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return `[${Error.prototype.toString.call(value)}]`;
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(key => {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str;
  const desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = `[${key}]`;
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(line => `  ${line}`).join('\n').substr(2);
        } else {
          str = `\n${str.split('\n').map(line => `   ${line}`).join('\n')}`;
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify(`${key}`);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }
  return `${name}: ${str}`;
}

function reduceToSingleString(output, base, braces) {
  let numLinesEst = 0;
  const length = output.reduce((prev, cur) => {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return `${braces[0]}${base === '' ? '' : base + '\n '} ${output.join(',\n  ')} ${braces[1]}`;
  }

  return `${braces[0]}${base} ${output.join(', ')} ${braces[1]}`;
}

exports.types = types;

const utilTypes = ['Array', 'Boolean', 'Null', 'Number', 'String', 'Symbol', 'Undefined', 'RegExp', 'Object', 'Date', 'Error', 'Function', 'Primitive'];
utilTypes.forEach(type => {
  const method = `is${type}`;
  const typeCheckFunction = arg => {
    switch (type) {
      case 'Array': return Array.isArray(arg);
      case 'Boolean': return typeof arg === 'boolean';
      case 'Null': return arg === null;
      case 'Number': return typeof arg === 'number';
      case 'String': return typeof arg === 'string';
      case 'Symbol': return typeof arg === 'symbol';
      case 'Undefined': return arg === undefined;
      case 'RegExp': return isObject(arg) && objectToString(arg) === '[object RegExp]';
      case 'Object': return typeof arg === 'object' && arg !== null;
      case 'Date': return isObject(arg) && objectToString(arg) === '[object Date]';
      case 'Error': return isObject(arg) && (objectToString(arg) === '[object Error]' || arg instanceof Error);
      case 'Function': return typeof arg === 'function';
      case 'Primitive': return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || typeof arg === 'undefined';
    }
  };
  exports[method] = exports.types[method] = typeCheckFunction;
});

exports.types.isNativeError = exports.isError;
exports.isBuffer = isBuffer;

// Log with timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};

exports.inherits = inherits;

// Extend objects
exports._extend = function(origin, add) {
  if (!add || !isObject(add)) return origin;
  const keys = Object.keys(add);
  for (let i = keys.length - 1; i >= 0; i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;
exports.promisify = function promisify(original) {
  if (typeof original !== 'function') throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    const fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    Object.defineProperty(fn, kCustomPromisifiedSymbol, { value: fn, enumerable: false, writable: false, configurable: true });
    return fn;
  }

  function fn() {
    let promiseResolve, promiseReject;
    const promise = new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    const args = Array.prototype.slice.call(arguments);
    args.push((err, value) => {
      if (err) promiseReject(err);
      else promiseResolve(value);
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(fn, getOwnPropertyDescriptors(original));
};

exports.promisify.custom = kCustomPromisifiedSymbol;

function callbackifyOnRejected(reason, cb) {
  if (!reason) {
    const newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') throw new TypeError('The "original" argument must be of type Function');

  function callbackified() {
    const args = Array.prototype.slice.call(arguments);
    const maybeCb = args.pop();
    if (typeof maybeCb !== 'function') throw new TypeError('The last argument must be of type Function');
    const self = this;
    const cb = function() {
      return maybeCb.apply(self, arguments);
    };
    original.apply(this, args)
      .then(ret => process.nextTick(cb.bind(null, null, ret)), rej => process.nextTick(callbackifyOnRejected.bind(null, rej, cb)));
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  return Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
}

exports.callbackify = callbackify;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? `0${n}` : n;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Timestamp format
function timestamp() {
  const d = new Date();
  const time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return `${d.getDate()} ${months[d.getMonth()]} ${time}`;
}
