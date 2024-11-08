'use strict';

const required = require('requires-port');
const qs = require('querystringify');

const regex = {
  controlOrWhitespace: /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,
  CRHTLF: /[\n\r\t]/g,
  slashes: /^[A-Za-z][A-Za-z0-9+-.]*:\/\//,
  port: /:\d+$/,
  protocol: /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,
  windowsDriveLetter: /^[a-zA-Z]:/
};

function trimLeft(str) {
  return (str || '').toString().replace(regex.controlOrWhitespace, '');
}

const rules = [
  ['#', 'hash'],                       
  ['?', 'query'],                      
  (addr, url) => (isSpecial(url.protocol) ? addr.replace(/\\/g, '/') : addr),
  ['/', 'pathname'],                   
  ['@', 'auth', 1],                    
  [NaN, 'host', undefined, 1, 1],      
  [/:(\d*)$/, 'port', undefined, 1],   
  [NaN, 'hostname', undefined, 1, 1]   
];

const ignoreProps = { hash: 1, query: 1 };

function lolcation(loc) {
  const globalObj = typeof window !== 'undefined' ? window
                     : typeof global !== 'undefined' ? global
                     : typeof self !== 'undefined' ? self : {};

  const location = globalObj.location || {};
  loc = loc || location;

  let finalLocation = {}, type = typeof loc;

  if (loc.protocol === 'blob:') {
    finalLocation = new Url(unescape(loc.pathname), {});
  } else if (type === 'string') {
    finalLocation = new Url(loc, {});
    Object.keys(ignoreProps).forEach(key => delete finalLocation[key]);
  } else if (type === 'object') {
    Object.keys(loc).forEach(key => {
      if (!(key in ignoreProps)) finalLocation[key] = loc[key];
    });
    if (finalLocation.slashes === undefined) {
      finalLocation.slashes = regex.slashes.test(loc.href);
    }
  }

  return finalLocation;
}

function isSpecial(scheme) {
  return ['file:', 'ftp:', 'http:', 'https:', 'ws:', 'wss:'].includes(scheme);
}

function extractProtocol(address, location = {}) {
  address = trimLeft(address).replace(regex.CRHTLF, '');
  const match = regex.protocol.exec(address);

  const protocol = match[1]?.toLowerCase() || '';
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
    rest = otherSlashes ? match[3] + match[4] : match[4];
    slashesCount = otherSlashes ? match[3].length : 0;
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
    rest
  };
}

function resolve(relative, base) {
  if (!relative) return base;

  const path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'));
  let i = path.length, last = path[i - 1], unshift = false, up = 0;

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
  address = trimLeft(address).replace(regex.CRHTLF, '');

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  let relative, extracted, parse, instruction, index, key;
  const instructions = rules.slice();
  let type = typeof location;
  const url = this;

  if (type !== 'object' && type !== 'string') {
    parser = location;
    location = null;
  }

  if (parser && typeof parser !== 'function') parser = qs.parse;

  location = lolcation(location);

  extracted = extractProtocol(address || '', location);
  relative = !extracted.protocol && !extracted.slashes;
  this.slashes = extracted.slashes || (relative && location.slashes);
  this.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  if (
    extracted.protocol === 'file:' && (extracted.slashesCount !== 2 || regex.windowsDriveLetter.test(address)) ||
    (!extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(this.protocol)))
  ) {
    instructions[3] = [/(.*)/, 'pathname'];
  }

  instructions.forEach(ins => {
    if (typeof ins === 'function') {
      address = ins(address, this);
      return;
    }

    parse = ins[0];
    key = ins[1];

    if (parse !== parse) {
      this[key] = address;
    } else if (typeof parse === 'string') {
      index = parse === '@'
        ? address.lastIndexOf(parse)
        : address.indexOf(parse);

      if (index !== -1) {
        if (typeof ins[2] === 'number') {
          this[key] = address.slice(0, index);
          address = address.slice(index + ins[2]);
        } else {
          this[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      this[key] = index[1];
      address = address.slice(0, index.index);
    }

    this[key] = this[key] || (relative && ins[3] ? location[key] || '' : '');

    if (ins[4]) this[key] = this[key].toLowerCase();
  });

  if (parser) this.query = parser(this.query);

  if (relative && location.slashes && this.pathname.charAt(0) !== '/' && (this.pathname || location.pathname)) {
    this.pathname = resolve(this.pathname, location.pathname);
  }

  if (this.pathname.charAt(0) !== '/' && isSpecial(this.protocol)) {
    this.pathname = '/' + this.pathname;
  }

  if (!required(this.port, this.protocol)) {
    this.host = this.hostname;
    this.port = '';
  }

  this.username = this.password = '';

  if (this.auth) {
    index = this.auth.indexOf(':');
    if (index !== -1) {
      this.username = encodeURIComponent(decodeURIComponent(this.auth.slice(0, index)));
      this.password = encodeURIComponent(decodeURIComponent(this.auth.slice(index + 1)));
    } else {
      this.username = encodeURIComponent(decodeURIComponent(this.auth));
    }

    this.auth = this.password ? `${this.username}:${this.password}` : this.username;
  }

  this.origin = this.protocol !== 'file:' && isSpecial(this.protocol) && this.host
    ? `${this.protocol}//${this.host}` : 'null';

  this.href = this.toString();
}

Url.prototype.set = function(part, value, fn) {
  switch (part) {
    case 'query':
      this[part] = typeof value === 'string' && value.length ? (fn || qs.parse)(value) : value;
      break;
    case 'port':
      this[part] = value;
      if (!required(value, this.protocol)) {
        this.host = this.hostname;
        this[part] = '';
      } else if (value) {
        this.host = `${this.hostname}:${value}`;
      }
      break;
    case 'hostname':
      this[part] = value;
      if (this.port) value += `:${this.port}`;
      this.host = value;
      break;
    case 'host':
      this[part] = value;
      if (regex.port.test(value)) {
        const splitVal = value.split(':');
        this.port = splitVal.pop();
        this.hostname = splitVal.join(':');
      } else {
        this.hostname = value;
        this.port = '';
      }
      break;
    case 'protocol':
      this.protocol = value.toLowerCase();
      this.slashes = !fn;
      break;
    case 'pathname':
    case 'hash':
      this[part] = value ? (value.charAt(0) === (part === 'pathname' ? '/' : '#') ? value : part === 'pathname' ? '/' + value : '#' + value) : value;
      break;
    case 'username':
    case 'password':
      this[part] = encodeURIComponent(value);
      break;
    case 'auth':
      const authIndex = value.indexOf(':');
      if (authIndex !== -1) {
        this.username = encodeURIComponent(decodeURIComponent(value.slice(0, authIndex)));
        this.password = encodeURIComponent(decodeURIComponent(value.slice(authIndex + 1)));
      } else {
        this.username = encodeURIComponent(decodeURIComponent(value));
      }
  }

  rules.forEach(ins => {
    if (ins[4]) this[ins[1]] = this[ins[1]].toLowerCase();
  });

  this.auth = this.password ? `${this.username}:${this.password}` : this.username;
  this.origin = this.protocol !== 'file:' && isSpecial(this.protocol) && this.host ? `${this.protocol}//${this.host}` : 'null';
  this.href = this.toString();

  return this;
}

Url.prototype.toString = function(stringify) {
  if (!stringify || typeof stringify !== 'function') {
    stringify = qs.stringify;
  }

  let query;
  const host = this.host;
  let protocol = this.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  let result = protocol + ((this.protocol && this.slashes) || isSpecial(this.protocol) ? '//' : '');

  if (this.username) {
    result += this.username;
    if (this.password) result += ':' + this.password;
    result += '@';
  } else if (this.password) {
    result += ':' + this.password + '@';
  } else if (this.protocol !== 'file:' && isSpecial(this.protocol) && !host && this.pathname !== '/') {
    result += '@';
  }

  if (host[host.length - 1] === ':' || (regex.port.test(this.hostname) && !this.port)) {
    host += ':';
  }

  result += host + this.pathname;

  query = typeof this.query === 'object' ? stringify(this.query) : this.query;
  if (query) result += query.charAt(0) !== '?' ? '?' + query : query;

  if (this.hash) result += this.hash;

  return result;
}

module.exports = Url;
