js
// debug.js

const util = require('util');
const fs = require('fs');

const colors = [6, 2, 3, 4, 5, 1];
let namespaces = [];
let skips = [];
let formatters = {};

// Utility to select a random color for a namespace
function selectColor(namespace) {
  let hash = 0;
  for (let char of namespace) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0; // Convert to 32bit integer
  }
  return colors[Math.abs(hash) % colors.length];
}

// Enables namespaces
function enable(namespaces) {
  save(namespaces);
  const splits = (namespaces || '').split(/[\s,]+/);
  splits.forEach(name => {
    if (!name) return; // ignore empty strings
    name = name.replace(/\*/g, '.*?');
    if (name.startsWith('-')) {
      skips.push(new RegExp('^' + name.substring(1) + '$'));
    } else {
      namespaces.push(new RegExp('^' + name + '$'));
    }
  });
}

// Check if a debug namespace is enabled
function enabled(name) {
  if (name.endsWith('*')) {
    return true;
  }
  
  if (skips.some(skip => skip.test(name))) {
    return false;
  }
  
  return namespaces.some(namespace => namespace.test(name));
}

// Create a debug instance with specified namespace
function createDebug(namespace) {
  // Define the color for this debug instance
  let color = selectColor(namespace);
  
  function debug(...args) {
    if (!debug.enabled) return;
    
    const self = debug;
    
    // Set formatting options
    args[0] = coerce(args[0]);
    let index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
      if (match === '%%') return match;
      index++;
      const formatter = formatters[format];
      if (typeof formatter === 'function') {
        const val = args[index];
        match = formatter.call(self, val);
        args.splice(index, 1);
        index--;
      }
      return match;
    });
    
    // Apply color for browser or TTY terminals
    const colorCode = useColors() ? `\u001b[3${color < 8 ? color : '8;5;' + color}` + `;1m${namespace} ` + `\u001b[0m` : `${namespace} `;
    args[0] = colorCode + args[0];
    
    // Log it
    console.error(...args);
  }
  
  debug.namespace = namespace;
  debug.enabled = enabled(namespace);
  debug.color = color;
  debug.extend = extend;
  
  return debug;
}

// Check if colors should be used
function useColors() {
  return (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') ||
    (typeof navigator !== 'undefined' && /chrome|firefox|edge/i.test(navigator.userAgent)) ||
    false;
}

// Add a basic formatter
formatters.o = function(v) {
  return util.inspect(v, { colors: this.useColors(), depth: null });
};

// Push namespaces/skips from both localStorage and environment variable
function load() {
  try {
    return localStorage.debug;
  } catch (e) {
    return process.env.DEBUG;
  }
}

// Save the configured namespaces to ensure persistence
function save(namespaces) {
  try {
    localStorage.debug = namespaces;
  } catch (e) {
    process.env.DEBUG = namespaces;
  }
}

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

function extend(namespace, delimiter) {
  const newNamespace = this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace;
  const newDebug = createDebug(newNamespace);
  newDebug.log = this.log;
  return newDebug;
}

enable(load());

// Exporting the module
module.exports = createDebug;
module.exports.enable = enable;
module.exports.disable = function() {
  const previous = namespaces.length ? namespaces.join(',') : skips.length ? '-' + skips.join(',') : '';
  enable('');
  return previous;
};
module.exports.enabled = enabled;
module.exports.formatters = formatters;
