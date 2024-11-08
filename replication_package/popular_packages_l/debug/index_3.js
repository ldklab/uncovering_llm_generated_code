js
const util = require('util');
const colors = [6, 2, 3, 4, 5, 1];
let enabledNamespaces = [];
let disabledNamespaces = [];
let formatters = {};

function selectColor(namespace) {
  let hash = 0;
  for (const char of namespace) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
  }
  return colors[Math.abs(hash) % colors.length];
}

function enable(namespaces) {
  try { 
    localStorage.debug = namespaces; 
  } catch { 
    process.env.DEBUG = namespaces; 
  }

  const split = namespaces.split(/[\s,]+/);
  split.forEach(ns => {
    if (!ns) return;
    const formattedNs = ns.replace(/\*/g, '.*?');
    if (ns[0] === '-') {
      disabledNamespaces.push(new RegExp('^' + formattedNs.slice(1) + '$'));
    } else {
      enabledNamespaces.push(new RegExp('^' + formattedNs + '$'));
    }
  });
}

function isEnabled(namespace) {
  if (namespace.endsWith('*')) return true;
  if (disabledNamespaces.some(re => re.test(namespace))) return false;
  return enabledNamespaces.some(re => re.test(namespace));
}

function createDebugInstance(namespace) {
  const color = selectColor(namespace);
  
  function debug(...args) {
    if (!isEnabled(namespace)) return;
    args[0] = formatArgs(args[0]);
    const msg = `${useColors() ? `\x1B[3${color}m${namespace}` : namespace} ${args.join(' ')}`;
    console.error(msg);
  }

  debug.namespace = namespace;
  return debug;
}

function formatArgs(arg) {
  return coercion(arg).replace(/%([a-zA-Z%])/g, (match, fmt) => {
    if (match === '%%') return '%';
    const formatter = formatters[fmt];
    return formatter ? formatter(arg) : match;
  });
}

function coercion(val) {
  return val instanceof Error ? val.stack || val.message : val;
}

function useColors() {
  return (typeof process !== 'undefined' && process.env.TERM !== 'dumb') || false;
}

formatters.o = function(v) {
  return util.inspect(v, { colors: useColors() });
};

function loadNamespaces() {
  try {
    return localStorage.debug;
  } catch {
    return process.env.DEBUG;
  }
}

enable(loadNamespaces());

module.exports = {
  createDebug: createDebugInstance,
  enable,
  disable: () => {
    const prev = enabledNamespaces.join(',') || '-' + disabledNamespaces.join(',');
    enable('');
    return prev;
  },
  isEnabled,
  formatters
};
