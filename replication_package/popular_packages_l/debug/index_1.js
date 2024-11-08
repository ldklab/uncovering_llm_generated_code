js
// debug.js

const util = require('util');
const fs = require('fs');

const colors = [6, 2, 3, 4, 5, 1];
let namespaces = [];
let skips = [];
let formatters = {};

function selectColor(namespace) {
  let hash = 0;
  for (let i = 0; i < namespace.length; i++) {
    hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

function enable(namespacesStr) {
  save(namespacesStr);
  namespaces = [];
  skips = [];
  const split = (namespacesStr || '').split(/[\s,]+/);
  split.forEach(name => {
    if (!name) return;
    name = name.replace(/\*/g, '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      namespaces.push(new RegExp('^' + name + '$'));
    }
  });
}

function enabled(name) {
  if (name[name.length - 1] === '*') return true;
  for (let i = 0; i < skips.length; i++) {
    if (skips[i].test(name)) return false;
  }
  for (let i = 0; i < namespaces.length; i++) {
    if (namespaces[i].test(name)) return true;
  }
  return false;
}

function createDebug(namespace) {
  const color = selectColor(namespace);

  function debug(...args) {
    if (!debug.enabled) return;

    args[0] = coerce(args[0]);
    let index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
      if (match === '%%') return match;
      index++;
      const formatter = formatters[format];
      if (typeof formatter === 'function') {
        const val = args[index];
        match = formatter.call(debug, val);
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    args[0] = (useColors() ? `\u001b[3${color < 8 ? color : '8;5;' + color}` + `;1m${namespace} ` + `\u001b[0m` : `${namespace} `) + args[0];

    console.error.apply(console, args);
  }

  debug.namespace = namespace;
  debug.enabled = enabled(namespace);
  debug.color = color;
  debug.extend = extend;

  return debug;
}

function useColors() {
  return (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') ||
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(chrome|firefox|edge)/)) ||
    false;
}

formatters.o = function(v) {
  return util.inspect(v, { colors: this.useColors, depth: null });
};

function load() {
  try {
    return localStorage.debug;
  } catch (e) {
    return process.env.DEBUG;
  }
}

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
  const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  newDebug.log = this.log;
  return newDebug;
}

enable(load());

module.exports = createDebug;
module.exports.enable = enable;
module.exports.disable = function() {
  const previous = namespaces.join(',') || (namespaces.length ? '-' + skips.join(',') : '');
  enable('');
  return previous;
};
module.exports.enabled = enabled;
module.exports.formatters = formatters;
