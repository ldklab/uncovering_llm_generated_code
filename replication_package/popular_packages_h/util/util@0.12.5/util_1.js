const util = require('util');
const inherits = require('inherits');

// Polyfill for `Object.getOwnPropertyDescriptors`
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || ((obj) => {
  const keys = Object.keys(obj);
  const descriptors = {};
  keys.forEach((key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
  });
  return descriptors;
});

// Format-like function, replacing `%s`, `%d`, `%j`, `%%` placeholders
const formatRegExp = /%[sdj%]/g;
exports.format = function (f) {
  if (typeof f !== 'string') {
    return Array.from(arguments).map(inspect).join(' ');
  }

  let i = 1;
  const args = arguments;
  const len = args.length;
  
  const str = String(f).replace(formatRegExp, x => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch {
          return '[Circular]';
        }
    }
    return x;
  });

  for (let x = args[i]; i < len; x = args[++i]) {
    if (x == null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }

  return str;
};

// Deprecate function; warns about using a deprecated method
exports.deprecate = function(fn, msg) {
  if (process.noDeprecation) return fn;

  let warned = false;
  function deprecated() {
    if (!warned) {
      warned = true;
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
    }
    return fn.apply(this, arguments);
  }
  
  return deprecated;
};

// Debug logging based on NODE_DEBUG
const debugs = {};
let debugEnvRegex = /^$/;
if (process.env.NODE_DEBUG) {
  let debugEnv = process.env.NODE_DEBUG
    .replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
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
      debugs[set] = function(...args) {
        const msg = exports.format.apply(null, args);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};

// Inspect function for deep inspection of objects
function inspect(obj, opts) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor
  };

  if (typeof opts === 'boolean') {
    ctx.showHidden = opts;
  } else if (opts) {
    Object.assign(ctx, opts);
  }

  if (ctx.colors) ctx.stylize = stylizeWithColor;
  if (ctx.showHidden === undefined) ctx.showHidden = false;
  if (ctx.depth === undefined) ctx.depth = 2;
  if (ctx.colors === undefined) ctx.colors = false;
  if (ctx.customInspect === undefined) ctx.customInspect = true;

  return formatValue(ctx, obj, ctx.depth);
}

// Stylize with color
function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];

  if (style) {
    return `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m`;
  }
  return str;
}

// Stylize without color
function stylizeNoColor(str) {
  return str;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && typeof value.inspect === 'function' &&
      value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
    
    let ret = value.inspect(recurseTimes, ctx);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  const primitive = formatPrimitive(ctx, value);
  if (primitive) return primitive;

  const keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);
  
  if (ctx.showHidden) {
    keys.push(...Object.getOwnPropertyNames(value).filter(k => !visibleKeys[k]));
  }

  if (keys.length === 0) {
    if (typeof value === 'function') {
      return ctx.stylize('[Function' + (value.name ? ': ' + value.name : '') + ']', 'special');
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

  if (recurseTimes < 0) {
    return ctx.stylize(isRegExp(value) ? RegExp.prototype.toString.call(value) : '[Object]', 'special');
  }

  ctx.seen.push(value);

  const output = isArray(value) ?
    formatArray(ctx, value, recurseTimes, visibleKeys, keys) :
    keys.map(key => formatProperty(ctx, value, recurseTimes, visibleKeys, key, isArray(value)));

  ctx.seen.pop();

  return reduceToSingleString(output, '', isArray(value) ? ['[', ']'] : ['{', '}']);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    const simple = `'${JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"')}'`;
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0; i < value.length; ++i) {
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
  let name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };

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
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      str = formatValue(ctx, desc.value, recurseTimes === null ? null : recurseTimes - 1);

      if (str.includes('\n')) {
        str = array ? str.split('\n').map(line => '  ' + line).join('\n').slice(2) : '\n' + str.split('\n').map(line => '   ' + line).join('\n');
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }

  if (isUndefined(name)) {
    name = JSON.stringify('' + key);
    if (!name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
    }
    name = ctx.stylize(name, typeof key === 'string' ? 'string' : 'name');
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  const length = output.reduce((prev, cur) => {
    if (cur.includes('\n')) return prev + 1;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);
  
  if (length > 60) {
    return `${braces[0]}${base === '' ? '' : base + '\n '}${output.join(',\n  ')} ${braces[1]}`;
  }
  return `${braces[0]}${base} ${output.join(', ')} ${braces[1]}`;
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Exports miscellaneous functions and utilities
exports.isArray = Array.isArray;
exports.isBoolean = arg => typeof arg === 'boolean';
exports.isNull = arg => arg === null;
exports.isNullOrUndefined = arg => arg == null;
exports.isNumber = arg => typeof arg === 'number';
exports.isString = arg => typeof arg === 'string';
exports.isSymbol = arg => typeof arg === 'symbol';
exports.isUndefined = arg => arg === void 0;
exports.isRegExp = arg => typeof arg === 'object' && Object.prototype.toString.call(arg) === '[object RegExp]';
exports.isObject = arg => typeof arg === 'object' && arg !== null;
exports.isDate = arg => typeof arg === 'object' && Object.prototype.toString.call(arg) === '[object Date]';
exports.isError = arg => typeof arg === 'object' && (Object.prototype.toString.call(arg) === '[object Error]' || arg instanceof Error);
exports.isFunction = arg => typeof arg === 'function';
exports.isPrimitive = arg => arg === null || ['boolean', 'number', 'string', 'symbol', 'undefined'].includes(typeof arg);
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};
exports.inherits = inherits;
exports.promisify = util.promisify;
exports.callbackify = util.callbackify;
