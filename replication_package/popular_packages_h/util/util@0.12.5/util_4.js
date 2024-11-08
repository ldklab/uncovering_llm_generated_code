const util = require('util');
const process = require('process');

// Polyfill for Object.getOwnPropertyDescriptors if not available
function getOwnPropertyDescriptors(obj) {
  return Object.keys(obj).reduce((descriptors, key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
    return descriptors;
  }, {});
}

// Format utility using string replacement
const formatRegExp = /%[sdj%]/g;

function format(f, ...args) {
  if (typeof f !== 'string') {
    return args.map(arg => inspect(arg)).join(' ');
  }

  let i = 0;
  const formattedStr = f.replace(formatRegExp, x => {
    if (x === '%%') return '%';
    if (i >= args.length) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch {
          return '[Circular]';
        }
      default:
        return x;
    }
  });

  return args.slice(i).reduce((str, x) => {
    return str + (x == null || typeof x !== 'object' ? ` ${x}` : ` ${inspect(x)}`);
  }, formattedStr);
}

// Mark function as deprecated
function deprecate(fn, msg) {
  if (process.noDeprecation) return fn;

  let warned = false;
  const deprecatedFn = function(...args) {
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

  return deprecatedFn;
}

// Debug logging utility
const debugs = {};
let debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  const debugEnv = process.env.NODE_DEBUG.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp(`^${debugEnv}$`, 'i');
}

function debuglog(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      const pid = process.pid;
      debugs[set] = (...args) => {
        const msg = format(...args);
        console.error(`${set} ${pid}: ${msg}`);
      };
    } else {
      debugs[set] = () => {};
    }
  }
  return debugs[set];
}

// Object inspection utility
function inspect(obj, opts = {}) {
  return util.inspect(obj, { ...opts, colors: false });
}

// Timestamped log
function log(...args) {
  console.log(`${new Date().toISOString()} - ${format(...args)}`);
}

// Exporting utilities
module.exports = {
  format,
  deprecate,
  debuglog,
  inspect,
  log
};
