'use strict';

const required = require('requires-port');
const qs = require('querystringify');
const slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
const protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
const whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]';
const left = new RegExp(`^${whitespace}+`);

// Trim leading whitespace
function trimLeft(str) {
  return (str || '').toString().replace(left, '');
}

// Parsing rules
const rules = [
  ['#', 'hash'],
  ['?', 'query'],
  address => address.replace('\\', '/'),
  ['/', 'pathname'],
  ['@', 'auth', 1],
  [NaN, 'host', undefined, 1, 1],
  [/:([\d]+)$/, 'port', undefined, 1],
  [NaN, 'hostname', undefined, 1, 1]
];

// Ignored properties
const ignore = { hash: 1, query: 1 };

// Derive location context
function lolcation(loc) {
  let globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof global !== 'undefined') globalVar = global;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  const location = globalVar.location || {};
  loc = loc || location;

  let finaldestination = {};
  const type = typeof loc;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if (type === 'string') {
    finaldestination = new Url(loc, {});
    for (const key in ignore) delete finaldestination[key];
  } else if (type === 'object') {
    for (const key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (typeof finaldestination.slashes === 'undefined') {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

// Extract protocol
function extractProtocol(address) {
  address = trimLeft(address);
  const match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: Boolean(match[2]),
    rest: match[3]
  };
}

// Resolve path
function resolve(relative, base) {
  if (relative === '') return base;

  const path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'));
  let i = path.length;
  let last = path[i - 1];
  let unshift = false;
  let up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

// URL class
function Url(address, location, parser) {
  address = trimLeft(address);

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  let relative, extracted, parse, instruction, index, key;
  const instructions = rules.slice();
  const type = typeof location;
  const url = this;
  let i = 0;

  if (type !== 'object' && type !== 'string') {
    parser = location;
    location = null;
  }

  if (parser && typeof parser !== 'function') parser = qs.parse;

  location = lolcation(location);

  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || (relative && location.slashes);
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if (typeof parse === 'string') {
      if (~(index = address.indexOf(parse))) {
        if (typeof instruction[2] === 'number') {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (relative && instruction[3] ? location[key] || '' : '');

    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  if (parser) url.query = parser(url.query);

  if (
    relative &&
    location.slashes &&
    url.pathname.charAt(0) !== '/' &&
    (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? `${url.protocol}//${url.host}`
    : 'null';

  url.href = url.toString();
}

// Set method
function set(part, value, fn) {
  const url = this;

  switch (part) {
    case 'query':
      if (typeof value === 'string' && value.length) {
        value = (fn || qs.parse)(value);
      }
      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = `${url.hostname}:${value}`;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += `:${url.port}`;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        const char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (let i = 0; i < rules.length; i++) {
    if (rules[i][4]) url[rules[i][1]] = url[rules[i][1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? `${url.protocol}//${url.host}`
    : 'null';

  url.href = url.toString();

  return url;
}

// ToString method
function toString(stringify) {
  if (!stringify || typeof stringify !== 'function') stringify = qs.stringify;

  let query;
  const url = this;
  let protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  let result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += `:${url.password}`;
    result += '@';
  }

  result += url.host + url.pathname;

  query = typeof url.query === 'object' ? stringify(url.query) : url.query;
  if (query) result += query.charAt(0) !== '?' ? `?${query}` : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set, toString };

// Export the URL parser and utilities
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;
