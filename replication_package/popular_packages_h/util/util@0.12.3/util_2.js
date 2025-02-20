// Utility library functions for Node.js

const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function (obj) {
  const keys = Object.keys(obj);
  const descriptors = {};
  keys.forEach(key => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
  });
  return descriptors;
};

const formatRegExp = /%[sdj%]/g;

exports.format = function(f, ...args) {
  if (typeof f !== 'string') {
    return args.map(inspect).join(' ');
  }

  let i = 0;
  const str = f.replace(formatRegExp, x => {
    if (x === '%%') return '%';
    if (i >= args.length) return x;
    const arg = args[i++];
    switch (x) {
      case '%s': return String(arg);
      case '%d': return Number(arg);
      case '%j':
        try {
          return JSON.stringify(arg);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });

  return str + args.slice(i).map(arg => (arg == null || typeof arg !== 'object') ? ' ' + arg : ' ' + inspect(arg)).join('');
};

exports.deprecate = function(fn, msg) {
  if (process && process.noDeprecation) return fn;

  let warned = false;
  const deprecated = function(...args) {
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
    return fn.apply(this, args);
  };

  return deprecated;
};

const debugs = {};
let debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  const debugEnv = process.env.NODE_DEBUG.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp(`^${debugEnv}$`, 'i');
}

exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    debugLog = debugEnvRegex.test(set) ? (...args) => {
      console.error(`${set} ${process.pid}: ${exports.format(...args)}`);
    } : () => {};
    debugs[set] = debugLog;
  }
  return debugs[set];
};

function inspect(obj, opts = {}) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor,
    showHidden: false,
    depth: 2,
    colors: false,
    customInspect: true,
    ...opts
  };

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
  yellow: [33, 39]
};

inspect.styles = {
  special: 'cyan',
  number: 'yellow',
  boolean: 'yellow',
  undefined: 'grey',
  null: 'bold',
  string: 'green',
  date: 'magenta',
  regexp: 'red'
};

function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];
  return style ? `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m` : str;
}

function stylizeNoColor(str) {
  return str;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && typeof value.inspect === 'function' && value.inspect !== exports.inspect) {
    let ret = value.inspect(recurseTimes, ctx);
    return typeof ret !== 'string' ? formatValue(ctx, ret, recurseTimes) : ret;
  }

  const primitive = formatPrimitive(ctx, value);
  if (primitive) return primitive;

  const keys = ctx.showHidden ? Object.getOwnPropertyNames(value) : Object.keys(value);
  const visibleKeys = arrayToHash(keys);

  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0) {
    if (isFunction(value)) {
      return ctx.stylize(`[Function${value.name ? ': ' + value.name : ''}]`, 'special');
    }
    if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    if (isDate(value)) return ctx.stylize(Date.prototype.toString.call(value), 'date');
    if (isError(value)) return formatError(value);
  }

  let base = '', array = false, braces = ['{', '}'];
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }
  if (isFunction(value)) base = ` [Function${value.name ? ': ' + value.name : ''}]`;
  if (isRegExp(value)) base = ` ${RegExp.prototype.toString.call(value)}`;
  if (isDate(value)) base = ` ${Date.prototype.toUTCString.call(value)}`;
  if (isError(value)) base = ` ${formatError(value)}`;

  if (keys.length === 0 && (!array || value.length === 0)) {
    return `${braces[0]}${base}${braces[1]}`;
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    return ctx.stylize('[Object]', 'special');
  }

  ctx.seen.push(value);

  const output = array ? formatArray(ctx, value, recurseTimes, visibleKeys, keys) :
    keys.map(key => formatProperty(ctx, value, recurseTimes, visibleKeys, key, array));

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (value === undefined) return ctx.stylize('undefined', 'undefined');
  if (typeof value === 'string') {
    const simple = `'${JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"')}'`;
    return ctx.stylize(simple, 'string');
  }
  if (typeof value === 'number') return ctx.stylize(`${value}`, 'number');
  if (typeof value === 'boolean') return ctx.stylize(`${value}`, 'boolean');
  if (value === null) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return `[${Error.prototype.toString.call(value)}]`;
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0; i < value.length; ++i) {
    output.push(hasOwnProperty(value, String(i)) ? formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true) : '');
  }
  keys.forEach(key => {
    if (!/^\d+$/.test(key)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str;
  const desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    str = ctx.stylize(desc.set ? '[Getter/Setter]' : '[Getter]', 'special');
  } else if (desc.set) {
    str = ctx.stylize('[Setter]', 'special');
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = `[${key}]`;
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (recurseTimes == null) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.includes('\n')) {
        str = array ? str.split('\n').map(line => '  ' + line).join('\n').substr(2) : '\n' + str.split('\n').map(line => '   ' + line).join('\n');
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (name === undefined) {
    if (array && /^\d+$/.test(key)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/.test(name)) {
      name = ctx.stylize(name.slice(1, -1), 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }
  return `${name}: ${str}`;
}

function reduceToSingleString(output, base, braces) {
  const length = output.reduce((prev, cur) => {
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);
  if (length > 60) {
    return `${braces[0]}${base ? base + '\n ' : ''} ${output.join(',\n  ')} ${braces[1]}`;
  }
  return `${braces[0]}${base} ${output.join(', ')} ${braces[1]}`;
}

exports.types = require('./support/types');

function isArray(arg) {
  return Array.isArray(arg);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === undefined;
}
exports.isUndefined = isUndefined;

function isRegExp(arg) {
  return isObject(arg) && objectToString(arg) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(arg) {
  return isObject(arg) && objectToString(arg) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(arg) {
  return isObject(arg) && (objectToString(arg) === '[object Error]' || arg instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null || ['boolean', 'number', 'string', 'symbol', 'undefined'].includes(typeof arg);
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function timestamp() {
  const d = new Date();
  const time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function(...args) {
  console.log('%s - %s', timestamp(), exports.format(...args));
};

exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  if (!add || typeof add !== 'object') return origin;
  Object.keys(add).forEach(key => {
    origin[key] = add[key];
  });
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const kCustomPromisifiedSymbol = Symbol('util.promisify.custom');

exports.promisify = function(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');
  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    const fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn(...args) {
    const promise = new Promise((resolve, reject) => {
      args.push((err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
      original.apply(this, args);
    });

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
  Object.defineProperty(fn, kCustomPromisifiedSymbol, {
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
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  function callbackified(...args) {
    const maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    const cb = (...cbArgs) => maybeCb.call(this, ...cbArgs);

    original.apply(this, args)
      .then(ret => process.nextTick(cb.bind(null, null, ret)),
            rej => process.nextTick(callbackifyOnRejected.bind(null, rej, cb)));
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
  return callbackified;
}

exports.callbackify = callbackify;
