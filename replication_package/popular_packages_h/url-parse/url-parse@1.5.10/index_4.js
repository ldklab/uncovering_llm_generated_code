'use strict';

const required = require('requires-port');
const qs = require('querystringify');

const controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
const CRHTLF = /[\n\r\t]/g;
const slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
const port = /:\d+$/;
const protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
const windowsDriveLetter = /^[a-zA-Z]:/;

function trimLeft(str) {
  return (str ? str : '').toString().replace(controlOrWhitespace, '');
}

function isSpecial(scheme) {
  return (
    scheme === 'file:' ||
    scheme === 'ftp:' ||
    scheme === 'http:' ||
    scheme === 'https:' ||
    scheme === 'ws:' ||
    scheme === 'wss:'
  );
}

function extractProtocol(address, location) {
  address = trimLeft(address).replace(CRHTLF, '');
  const match = protocolre.exec(address);
  const protocol = match[1] ? match[1].toLowerCase() : '';
  const forwardSlashes = !!match[2];
  const otherSlashes = !!match[3];
  let slashesCount = 0;
  let rest;

  if (forwardSlashes) {
    if (otherSlashes) {
      rest = match[2] + match[3] + match[4];
      slashesCount = match[2].length + match[3].length;
    } else {
      rest = match[2] + match[4];
      slashesCount = match[2].length;
    }
  } else {
    if (otherSlashes) {
      rest = match[3] + match[4];
      slashesCount = match[3].length;
    } else {
      rest = match[4];
    }
  }

  if (protocol === 'file:') {
    if (slashesCount >= 2) rest = rest.slice(2);
  } else if (isSpecial(protocol)) {
    rest = match[4];
  } else if (protocol) {
    if (forwardSlashes) rest = rest.slice(2);
  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
    rest = match[4];
  }

  return {
    protocol,
    slashes: forwardSlashes || isSpecial(protocol),
    slashesCount,
    rest,
  };
}

function resolve(relative, base) {
  if (relative === '') return base;

  let path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'));
  let i = path.length;
  const last = path[i - 1];
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
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
  } else if ('object' === type) {
    Object.assign(finaldestination, loc);
    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }
  return finaldestination;
}

function Url(address, location, parser) {
  address = trimLeft(address).replace(CRHTLF, '');

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  const url = this;

  const extracted = extractProtocol(address || '', lolcation(location));
  const relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  const rules = [
    ['#', 'hash'],
    ['?', 'query'],
    function sanitize(address, url) {
      return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
    },
    ['/', 'pathname'],
    ['@', 'auth', 1],
    [NaN, 'host', undefined, 1, 1],
    [/:(\d*)$/, 'port', undefined, 1],
    [NaN, 'hostname', undefined, 1, 1]
  ];

  const ignore = { hash: 1, query: 1 };
  let instructions = rules.slice();

  if (
    extracted.protocol === 'file:' && (
      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
    (!extracted.slashes &&
      (extracted.protocol ||
        extracted.slashesCount < 2 ||
        !isSpecial(url.protocol)))
  ) {
    instructions[3] = [/(.*)/, 'pathname'];
  }

  let instruction, index;
  for (let i = 0; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address, url);
      continue;
    }

    const parse = instruction[0];
    const key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      index = parse === '@'
        ? address.lastIndexOf(parse)
        : address.indexOf(parse);

      if (~index) {
        if ('number' === typeof instruction[2]) {
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

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

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

  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
    url.pathname = '/' + url.pathname;
  }

  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  url.username = url.password = '';

  if (url.auth) {
    index = url.auth.indexOf(':');
    if (~index) {
      url.username = encodeURIComponent(decodeURIComponent(url.auth.slice(0, index)));
      url.password = encodeURIComponent(decodeURIComponent(url.auth.slice(index + 1)));
    } else {
      url.username = encodeURIComponent(decodeURIComponent(url.auth));
    }
    url.auth = url.password ? `${url.username}:${url.password}` : url.username;
  }

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? `${url.protocol}//${url.host}`
    : 'null';

  url.href = url.toString();
}

Url.prototype = {
  set(part, value, fn) {
    const url = this;

    switch (part) {
      case 'query':
        if ('string' === typeof value && value.length) {
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
        if (port.test(value)) {
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

      case 'username':
      case 'password':
        url[part] = encodeURIComponent(value);
        break;

      case 'auth':
        let index = value.indexOf(':');
        if (~index) {
          url.username = encodeURIComponent(decodeURIComponent(value.slice(0, index)));
          url.password = encodeURIComponent(decodeURIComponent(value.slice(index + 1)));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(value));
        }
    }

    for (let i = 0; i < rules.length; i++) {
      const ins = rules[i];
      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }

    url.auth = url.password ? `${url.username}:${url.password}` : url.username;
    url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
      ? `${url.protocol}//${url.host}`
      : 'null';
    url.href = url.toString();

    return url;
  },

  toString(stringify) {
    if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

    let query;
    const url = this;
    const protocol = url.protocol;
    let host = url.host;

    const result = 
      protocol +
      ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '') +
      (url.username ? `${url.username}${url.password ? `:${url.password}` : ''}@` : '') +
      (url.protocol !== 'file:' && isSpecial(url.protocol) && !host && url.pathname !== '/' ? '@' : '') + 
      host + url.pathname;

    query = 'object' === typeof url.query ? stringify(url.query) : url.query;
    if (query) result += query.charAt(0) !== '?' ? `?${query}` : query;
    if (url.hash) result += url.hash;

    return result;
  }
};

Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;
