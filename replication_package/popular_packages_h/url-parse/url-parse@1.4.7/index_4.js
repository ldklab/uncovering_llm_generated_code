'use strict';

const required = require('requires-port');
const qs = require('querystringify');

const slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
const protocolRe = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
const whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]';
const leftTrimRegexp = new RegExp('^' + whitespace + '+');

function trimLeft(str) {
  return (str || '').toString().replace(leftTrimRegexp, '');
}

const rules = [
  ['#', 'hash'],
  ['?', 'query'],
  address => address.replace('\\', '/'),
  ['/', 'pathname'],
  ['@', 'auth', 1],
  [NaN, 'host', undefined, 1, 1],
  [/:(\d+)$/, 'port', undefined, 1],
  [NaN, 'hostname', undefined, 1, 1]
];

const ignoreKeys = { hash: 1, query: 1 };

function getGlobalLocation(loc) {
  let globalVar;

  if (typeof window !== 'undefined') {
    globalVar = window;
  } else if (typeof global !== 'undefined') {
    globalVar = global;
  } else if (typeof self !== 'undefined') {
    globalVar = self;
  } else {
    globalVar = {};
  }

  const location = globalVar.location || {};
  loc = loc || location;

  const finalDestination = {};
  const locType = typeof loc;
  let key;

  if (loc.protocol === 'blob:') {
    Object.assign(finalDestination, new Url(unescape(loc.pathname), {}));
  } else if (locType === 'string') {
    Object.assign(finalDestination, new Url(loc, {}));
    for (key in ignoreKeys) delete finalDestination[key];
  } else if (locType === 'object') {
    for (key in loc) {
      if (!(key in ignoreKeys)) {
        finalDestination[key] = loc[key];
      }
    }

    if (finalDestination.slashes === undefined) {
      finalDestination.slashes = slashes.test(loc.href);
    }
  }

  return finalDestination;
}

function extractProtocol(address) {
  address = trimLeft(address);
  const match = protocolRe.exec(address);

  return {
    protocol: match && match[1] ? match[1].toLowerCase() : '',
    slashes: !!match && !!match[2],
    rest: match ? match[3] : ''
  };
}

function resolve(relative, base) {
  if (relative === '') return base;

  const basePath = (base || '/').split('/').slice(0, -1);
  const path = basePath.concat(relative.split('/'));
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

function Url(address, location, parser) {
  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  address = trimLeft(address);
  const type = typeof location;
  const urlObj = this;
  let relative, extracted, parse, instruction, key;

  if (type !== 'object' && type !== 'string') {
    parser = location;
    location = null;
  }

  parser = parser && typeof parser === 'function' ? parser : qs.parse;
  location = getGlobalLocation(location);

  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;

  urlObj.slashes = extracted.slashes || (relative && location.slashes);
  urlObj.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  if (!extracted.slashes) rules[3] = [/(.*)/, 'pathname'];

  for (let i = 0, len = rules.length; i < len; i++) {
    instruction = rules[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      urlObj[key] = address;
    } else if (typeof parse === 'string') {
      const index = address.indexOf(parse);
      if (index !== -1) {
        if (typeof instruction[2] === 'number') {
          urlObj[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          urlObj[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if (parse instanceof RegExp) {
      const match = parse.exec(address);
      if (match) {
        urlObj[key] = match[1];
        address = address.slice(0, match.index);
      }
    }

    urlObj[key] = urlObj[key] || (relative && instruction[3] ? location[key] || '' : '');

    if (instruction[4]) {
      urlObj[key] = urlObj[key].toLowerCase();
    }
  }

  if (parser) {
    urlObj.query = parser(urlObj.query);
  }

  if (relative && location.slashes && urlObj.pathname.charAt(0) !== '/' &&
    (urlObj.pathname !== '' || location.pathname !== '')) {
    urlObj.pathname = resolve(urlObj.pathname, location.pathname);
  }

  if (!required(urlObj.port, urlObj.protocol)) {
    urlObj.host = urlObj.hostname;
    urlObj.port = '';
  }

  urlObj.username = '';
  urlObj.password = '';
  if (urlObj.auth) {
    const [username, password] = urlObj.auth.split(':');
    urlObj.username = username || '';
    urlObj.password = password || '';
  }

  urlObj.origin = urlObj.protocol && urlObj.host &&
    urlObj.protocol !== 'file:' ? `${urlObj.protocol}//${urlObj.host}` : 'null';

  urlObj.href = urlObj.toString();
}

Url.prototype.set = function (part, value, fn) {
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
        url.port = '';
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
        const parts = value.split(':');
        url.port = parts.pop();
        url.hostname = parts.join(':');
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
      url[part] = value ? (value.charAt(0) === (part === 'pathname' ? '/' : '#') ? value : (part === 'pathname' ? '/' : '#') + value) : value;
      break;
    default:
      url[part] = value;
  }

  rules.forEach(ins => {
    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  });

  url.origin = url.protocol && url.host && url.protocol !== 'file:' ? `${url.protocol}//${url.host}` : 'null';
  url.href = url.toString();

  return url;
};

Url.prototype.toString = function (stringify) {
  const url = this;
  let query;
  let protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  let result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += `:${url.password}`;
    result += '@';
  }

  result += url.host + url.pathname;

  query = typeof url.query === 'object' ? (stringify || qs.stringify)(url.query) : url.query;
  if (query) result += query.charAt(0) !== '?' ? `?${query}` : query;

  if (url.hash) {
    result += url.hash;
  }

  return result;
};

// Export the URL parser and associated utilities
Url.extractProtocol = extractProtocol;
Url.location = getGlobalLocation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;
