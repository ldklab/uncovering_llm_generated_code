const hasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
const objectToString = (o) => Object.prototype.toString.call(o);

const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function (obj) {
  const keys = Object.keys(obj);
  const descriptors = {};
  for (let i = 0; i < keys.length; i++) {
    descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
  }
  return descriptors;
};

const isArray = Array.isArray;
const isBoolean = (arg) => typeof arg === 'boolean';
const isNull = (arg) => arg === null;
const isUndefined = (arg) => arg === void 0;
const isNumber = (arg) => typeof arg === 'number';
const isString = (arg) => typeof arg === 'string';
const isObject = (arg) => typeof arg === 'object' && arg !== null;
const isFunction = (arg) => typeof arg === 'function';
const isRegExp = (re) => isObject(re) && objectToString(re) === '[object RegExp]';
const isError = (e) => isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
const isDate = (d) => isObject(d) && objectToString(d) === '[object Date]';

const util = exports;

// Format function similar to printf, handling %s, %d, %j specifiers
util.format = function (f) {
  if (!isString(f)) {
    return Array.from(arguments).map(inspect).join(' ');
  }

  const args = arguments;
  let i = 1;
  let str = String(f).replace(/%[sdj%]/g, (x) => {
    if (x === '%%') return '%';
    if (i >= args.length) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default: return x;
    }
  });
  while (i < args.length) str += ' ' + formatValue(null, args[i++], 2);
  return str;
};

// Mark a function as deprecated
util.deprecate = function (fn, msg) {
  let warned = false;
  function deprecated() {
    if (!warned) {
      console.error(msg);
      warned = true;
    }
    return fn.apply(this, arguments);
  }
  return deprecated;
};

// Debug logging utility based on NODE_DEBUG environment variable
const debugs = {};
util.debuglog = function (set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    debugs[set] = function () { };
  }
  return debugs[set];
};

// Echos the value of an object, customized with options
function inspect(obj, opts) {
  const ctx = { seen: [], stylize: stylizeNoColor };
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    util._extend(ctx, opts);
  }
  ctx.showHidden = ctx.showHidden ?? false;
  ctx.depth = ctx.depth ?? 2;
  ctx.colors = ctx.colors ?? false;
  ctx.customInspect = ctx.customInspect ?? true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
util.inspect = inspect;
inspect.styles = {
  'special': 'cyan', 'number': 'yellow', 'boolean': 'yellow',
  'undefined': 'grey', 'null': 'bold', 'string': 'green',
  'date': 'magenta', 'regexp': 'red'
};
inspect.colors = {
  'bold': [1, 22], 'italic': [3, 23], 'underline': [4, 24],
  'inverse': [7, 27], 'white': [37, 39], 'grey': [90, 39],
  'black': [30, 39], 'blue': [34, 39], 'cyan': [36, 39],
  'green': [32, 39], 'magenta': [35, 39], 'red': [31, 39],
  'yellow': [33, 39]
};

function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];
  if (style) {
    return `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m`;
  }
  return str;
}

function stylizeNoColor(str) {
  return str;
}

function formatValue(ctx, value, recurseTimes) {
  const primitive = formatPrimitive(ctx, value);
  if (primitive) return primitive;

  const keys = Object.keys(value);
  ctx.showHidden && keys.push(...Object.getOwnPropertyNames(value).filter(k => !keys.includes(k)));

  if (keys.length === 0) {
    return ctx.stylize(`[${value}]`, 'special');
  }

  return formatProperty(ctx, value, recurseTimes);
}

function formatPrimitive(ctx, value) {
  const format = (type, val) => ctx.stylize(val, type);
  if (isUndefined(value)) return format('undefined', 'undefined');
  if (isString(value)) return format('string', `'${JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"')}'`);
  if (isNumber(value)) return format('number', '' + value);
  if (isBoolean(value)) return format('boolean', '' + value);
  if (isNull(value)) return format('null', 'null');
}

function formatProperty(ctx, value, recurseTimes, visibleKeys) {
  const keys = Object.getOwnPropertyNames(value);
  return keys.map(key => {
    const desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    let str = desc.get ? (desc.set ? '[Getter/Setter]' : '[Getter]') : desc.set ? '[Setter]' : '';

    if (!str && ctx.seen.indexOf(desc.value) < 0) {
      str = formatValue(ctx, desc.value, recurseTimes - 1);
      if (str.includes('\n')) str = str.split('\n').map(line => '   ' + line).join('\n');
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }

    return `${key}: ${str}`;
  }).join(', ');
}

// Convert callback-based functions to promise-based
util.promisify = function (original) {
  if (typeof original !== 'function') throw new TypeError('Argument must be a function');

  return function (...args) {
    return new Promise((resolve, reject) => {
      original(...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
  };
};

// Convert promise-based functions to callback-based
util.callbackify = function (original) {
  if (typeof original !== 'function') throw new TypeError('Argument must be a function');

  return function(...args) {
    const cb = args.pop();
    original(...args)
      .then(ret => process.nextTick(() => cb(null, ret)))
      .catch(err => process.nextTick(() => cb(err)));
  };
};

// Extend object properties
util._extend = function (target, source) {
  if (!isObject(source)) return target;
  const keys = Object.keys(source);
  for (let i = 0; i < keys.length; i++) {
    target[keys[i]] = source[keys[i]];
  }
  return target;
};

// Simple log function with a timestamp
util.log = function (...args) {
  console.log(`${new Date().toISOString()} - ${util.format(...args)}`);
};
