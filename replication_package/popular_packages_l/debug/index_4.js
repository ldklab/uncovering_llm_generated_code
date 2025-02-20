js
// debug.js

const util = require('util');
const fs = require('fs');

// Define constants for color selection and namespace management
const colors = [6, 2, 3, 4, 5, 1];
let activeNamespaces = [];
let skipPatterns = [];
let formatters = {};

// Selects a color based on namespace hash for consistency
function selectColor(namespace) {
  let hash = 0;
  for (let i = 0; i < namespace.length; i++) {
    hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

// Enables provided namespaces, handling wildcards and negations
function enable(namespacesString) {
  save(namespacesString);
  const splitNamespaces = (namespacesString || '').split(/[\s,]+/);

  activeNamespaces = [];
  skipPatterns = [];

  splitNamespaces.forEach(name => {
    if (!name) return;
    name = name.replace(/\*/g, '.*?');
    const regex = new RegExp('^' + name + '$');
    if (name[0] === '-') {
      skipPatterns.push(regex);
    } else {
      activeNamespaces.push(regex);
    }
  });
}

// Determines whether a specific namespace should be debugged
function enabled(namespace) {
  if (namespace.endsWith('*')) return true;

  for (let skip of skipPatterns) {
    if (skip.test(namespace)) return false;
  }

  for (let active of activeNamespaces) {
    if (active.test(namespace)) return true;
  }
  
  return false;
}

// Creates a debug function for a specific namespace
function createDebug(namespace) {
  const color = selectColor(namespace);

  function debug(...args) {
    if (!debug.enabled) return;

    args[0] = formatArguments(args[0]);

    const formattedArgs = args.map((arg, index) => {
      if (index === 0) {
        return addColors(arg, namespace, color);
      }
      return arg;
    });

    console.error(...formattedArgs);
  }

  debug.namespace = namespace;
  debug.enabled = enabled(namespace);
  debug.color = color;
  debug.extend = (additionalNamespace, delimiter = ':') => {
    const newNamespace = namespace + delimiter + additionalNamespace;
    return createDebug(newNamespace);
  };

  return debug;
}

// Applies any needed formatting to arguments
function formatArguments(arg) {
  return coerce(arg).replace(/%([a-zA-Z%])/g, (match, format) => {
    if (match === '%%') return match;
    const formatter = formatters[format];
    if (typeof formatter === 'function') {
      const val = formatter.call(null, args[index]);
      return val;
    }
    return match;
  });
}

// Adds color codes to messages for TTY-based terminals
function addColors(message, namespace, color) {
  if (useColors()) {
    const code = color < 8 ? color : '8;5;' + color;
    return `\u001b[3${code};1m${namespace} \u001b[0m${message}`;
  }
  return `${namespace} ${message}`;
}

// Determines whether the current environment supports color output
function useColors() {
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }
  
  if (typeof navigator !== 'undefined' && /chrome|firefox|edge/i.test(navigator.userAgent)) {
    return true;
  }
  
  return false;
}

// Formatter for "object" (%o) specifier
formatters.o = function(v) {
  return util.inspect(v, { colors: useColors(), depth: null });
};

// Loads saved namespaces (from localStorage or environment variables)
function load() {
  try {
    return localStorage.debug;
  } catch {
    return process.env.DEBUG;
  }
}

// Saves the active namespaces for persistent debugging configuration
function save(namespacesString) {
  try {
    localStorage.debug = namespacesString;
  } catch {
    process.env.DEBUG = namespacesString;
  }
}

// Converts values to a string form, especially errors
function coerce(val) {
  if (val instanceof Error) {
    return val.stack || val.message;
  }
  return val;
}

// Initialize with initially saved namespaces
enable(load());

// Module exports
module.exports = createDebug;
module.exports.enable = enable;
module.exports.disable = () => {
  const previous = [...activeNamespaces, ...skipPatterns.map(p => `-${p}`)].join(',');
  enable('');
  return previous;
};
module.exports.enabled = enabled;
module.exports.formatters = formatters;
