// Utility module providing formatting, debugging, deprecation warnings, and more.

const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(obj) {
  return Object.keys(obj).reduce((descriptors, key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
    return descriptors;
  }, {});
};

const formatRegExp = /%[sdj%]/g;
exports.format = function(f, ...args) {
  if (typeof f !== 'string') {
    return args.map(inspect).join(' ');
  }

  let i = 0;
  const str = f.replace(formatRegExp, (x) => {
    if (x === '%%') return '%';
    if (i >= args.length) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try { return JSON.stringify(args[i++]); } 
        catch (_) { return '[Circular]'; }
      default: return x;
    }
  });

  return str + args.slice(i).map(arg => isObject(arg) ? inspect(arg) : arg).join(' ');
};

exports.deprecate = function(fn, msg) {
  if (process && process.noDeprecation) return fn;

  let warned = false;
  return function deprecated(...args) {
    if (!warned) {
      if (process.throwDeprecation) throw new Error(msg);
      if (process.traceDeprecation) console.trace(msg);
      console.error(msg);
      warned = true;
    }
    return fn.apply(this, args);
  };
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
    if (debugEnvRegex.test(set)) {
      const pid = process.pid;
      debugs[set] = function(...msgArgs) {
        const msg = exports.format(...msgArgs);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};

function inspect(obj, opts = {}) {
  const ctx = { seen: [], stylize: stylizeNoColor, ...opts };
  ctx.depth = ctx.depth === undefined ? 2 : ctx.depth;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;

inspect.colors = {
  bold: [1, 22], italic: [3, 23], underline: [4, 24], inverse: [7, 27],
  white: [37, 39], grey: [90, 39], black: [30, 39], blue: [34, 39],
  cyan: [36, 39], green: [32, 39], magenta: [35, 39], red: [31, 39], yellow: [33, 39]
};
inspect.styles = {
  special: 'cyan', number: 'yellow', boolean: 'yellow',
  undefined: 'grey', null: 'bold', string: 'green', date: 'magenta', regexp: 'red'
};

function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];
  return style ? `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m` : str;
}

function stylizeNoColor(str) {
  return str;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value?.inspect && value.inspect !== exports.inspect) {
    let ret = value.inspect(recurseTimes, ctx);
    if (typeof ret !== 'string') ret = formatValue(ctx, ret, recurseTimes);
    return ret;
  }

  const primitive = formatPrimitive(ctx, value);
  if (primitive) return primitive;

  const keys = Object.keys(value);
  if (ctx.showHidden) keys = Object.getOwnPropertyNames(value);

  if (keys.length === 0) {
    if (isFunction(value)) return ctx.stylize(`[Function${value.name ? `: ${value.name}` : ''}]`, 'special');
    if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    if (isDate(value)) return ctx.stylize(Date.prototype.toString.call(value), 'date');
    if (isError(value)) return formatError(value);
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    return ctx.stylize('[Object]', 'special');
  }

  ctx.seen.push(value);

  const output = keys.map(key => formatProperty(ctx, value, recurseTimes, key, isArray(value)));
  ctx.seen.pop();

  return reduceToSingleString(output, '', ['{', '}']);
}

function formatPrimitive(ctx, value) {
  if (value === undefined) return ctx.stylize('undefined', 'undefined');
  if (typeof value === 'string') {
    return ctx.stylize(`'${value.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/"/g, '\\"')}'`, 'string');
  }
  if (typeof value === 'number') return ctx.stylize(`${value}`, 'number');
  if (typeof value === 'boolean') return ctx.stylize(`${value}`, 'boolean');
  if (value === null) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return `[${Error.prototype.toString.call(value)}]`;
}

function formatProperty(ctx, value, recurseTimes, key, array) {
  let str;
  const desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) str = ctx.stylize(`[Getter${desc.set ? '/Setter' : ''}]`, 'special');
  else if (desc.set) str = ctx.stylize('[Setter]', 'special');

  if (!str) {
    if (ctx.seen.includes(desc.value)) str = ctx.stylize('[Circular]', 'special');
    else {
      str = formatValue(ctx, desc.value, recurseTimes === null ? null : recurseTimes - 1);
      if (str.includes('\n')) {
        str = array ? str.split('\n').map(line => `  ${line}`).join('\n').slice(2) : `\n${str.split('\n').map(line => `   ${line}`).join('\n')}`;
      }
    }
  }

  const name = ctx.stylize(isNaN(Number(key)) ? JSON.stringify(`${key}`).replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/^"|"$/g, '\'') : key, 'name');
  return `${name}: ${str}`;
}

function reduceToSingleString(output, base, braces) {
  const length = output.reduce((prev, cur) => prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1, 0);
  if (length > 60) {
    return `${braces[0]} ${(base ? `${base}\n ` : '')} ${output.join(',\n  ')} ${braces[1]}`;
  }
  return `${braces[0]}${base ? ` ${base}` : ''} ${output.join(', ')} ${braces[1]}`;
}

function isArray(ar) {
  return Array.isArray(ar);
}
function isFunction(arg) {
  return typeof arg === 'function';
}
function isRegExp(re) {
  return re instanceof RegExp;
}
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
function isDate(d) {
  return d instanceof Date;
}
function isError(e) {
  return e instanceof Error || (typeof e === 'object' && e !== null && e.message && e.name);
}

exports.log = function(...args) {
  console.log('%s - %s', timestamp(), exports.format(...args));
};

function timestamp() {
  const d = new Date();
  const time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

exports.promisify = function(original) {
  if (typeof original !== 'function') throw new TypeError('The "original" argument must be of type Function');
  
  const kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol.for('nodejs.util.promisify.custom') : undefined;
  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    return original[kCustomPromisifiedSymbol];
  }

  function fn(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
      original.apply(this, args);
    });
  }

  return Object.defineProperties(fn, getOwnPropertyDescriptors(original));
};

exports.callbackify = function(original) {
  if (typeof original !== 'function') throw new TypeError('The "original" argument must be of type Function');

  function callbackified(...args) {
    const maybeCb = args.pop();
    if (typeof maybeCb !== 'function') throw new TypeError('The last argument must be of type Function');

    original.apply(this, args).then(
      ret => process.nextTick(() => maybeCb(null, ret)),
      rej => process.nextTick(() => maybeCb(rej))
    );
  }

  return Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
};

const hasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
