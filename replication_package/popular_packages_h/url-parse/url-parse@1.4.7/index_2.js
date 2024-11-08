'use strict';

const required = require('requires-port');
const qs = require('querystringify');

const slashesPattern = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
const protocolPattern = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
const whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]';
const leftWhitespacePattern = new RegExp('^' + whitespace + '+');

/**
 * Remove leading whitespace from a string.
 * @param {String} str - String to trim.
 * @return {String} - Trimmed string.
 * @public
 */
function trimLeft(str) {
  return (str || '').toString().replace(leftWhitespacePattern, '');
}

/**
 * URL parsing rules
 * 0: Indicator for parsing method.
 * 1: Name of the property to set.
 * 2: Number of extra characters to exclude from the split.
 * 3: Inherit from location if missing.
 * 4: Convert to lower case.
 */
const parseRules = [
  ['#', 'hash'],
  ['?', 'query'],
  (address) => address.replace('\\', '/'),
  ['/', 'pathname'],
  ['@', 'auth', 1],
  [NaN, 'host', undefined, 1, 1],
  [/:(\d+)$/, 'port', undefined, 1],
  [NaN, 'hostname', undefined, 1, 1]
];

const keysToIgnore = { hash: 1, query: 1 };

/**
 * Derive a location-like object from the current environment or a given object/string.
 * @param {Object|String} loc - Optional location object/string.
 * @returns {Object} - Location representation.
 * @public
 */
function getLocation(loc) {
  const globalObject = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self
    : {};

  const defaultLocation = globalObject.location || {};
  loc = loc || defaultLocation;

  const destination = {};
  const type = typeof loc;
  let key;

  if (loc.protocol === 'blob:') {
    Object.assign(destination, new Url(unescape(loc.pathname), {}));
  } else if (type === 'string') {
    Object.assign(destination, new Url(loc, {}));
    for (key in keysToIgnore) delete destination[key];
  } else if (type === 'object') {
    for (key in loc) {
      if (!(key in keysToIgnore)) {
        destination[key] = loc[key];
      }
    }

    if (destination.slashes === undefined) {
      destination.slashes = slashesPattern.test(loc.href);
    }
  }

  return destination;
}

/**
 * Extract protocol details from a URL string.
 * @param {String} address - The URL to parse.
 * @return {Object} - Protocol details.
 * @private
 */
function extractProtocol(address) {
  address = trimLeft(address);
  const match = protocolPattern.exec(address);

  return {
    protocol: (match[1] ? match[1].toLowerCase() : ''),
    slashes: Boolean(match[2]),
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base pathname.
 * @param {String} relative - Relative URL.
 * @param {String} base - Base URL.
 * @return {String} - Absolute URL.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  const baseParts = (base || '/').split('/').slice(0, -1);
  const relativeParts = relative.split('/');
  const path = baseParts.concat(relativeParts);

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

/**
 * URL object constructor for parsing and building URLs.
 * @constructor
 * @param {String} address - URL to parse.
 * @param {Object|String} [location] - Defaults for relative paths.
 * @param {Boolean|Function} [parser] - Query string parser.
 * @private
 */
class Url {
  constructor(address, location, parser) {
    address = trimLeft(address);

    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }

    let relative;
    let extracted;
    let parse;
    let instruction;
    let index;
    let key;
    const instructions = parseRules.slice();
    const type = typeof location;
    const url = this;
    let i = 0;

    if (type !== 'object' && type !== 'string') {
      parser = location;
      location = null;
    }

    if (parser && typeof parser !== 'function') {
      parser = qs.parse;
    }

    location = getLocation(location);

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
      ? url.protocol + '//' + url.host
      : 'null';

    url.href = url.toString();
  }

  /**
   * Setter for URL properties.
   * @param {String} part - Property to change.
   * @param {Mixed} value - New value for the property.
   * @param {Boolean|Function} [fn] - Query parser or protocol double-slash flag.
   * @returns {Url} - Updated URL instance.
   * @public
   */
  set(part, value, fn) {
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
          url.host = url.hostname + ':' + value;
        }
        break;

      case 'hostname':
        url[part] = value;
        if (url.port) value += ':' + url.port;
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

    for (let i = 0; i < parseRules.length; i++) {
      const ins = parseRules[i];
      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:'
      ? url.protocol + '//' + url.host
      : 'null';

    url.href = url.toString();

    return url;
  }

  /**
   * Convert URL object to string.
   * @param {Function} [stringify] - Query stringify function.
   * @return {String} - Full URL string.
   * @public
   */
  toString(stringify) {
    if (!stringify || typeof stringify !== 'function') stringify = qs.stringify;

    const query = typeof this.query === 'object' ? stringify(this.query) : this.query;
    const protocol = this.protocol && this.protocol.charAt(this.protocol.length - 1) !== ':' ? this.protocol + ':' : this.protocol;
    let urlString = protocol + (this.slashes ? '//' : '');

    if (this.username) {
      urlString += this.username;
      if (this.password) urlString += ':' + this.password;
      urlString += '@';
    }

    urlString += this.host + this.pathname;
    if (query) urlString += '?' !== query.charAt(0) ? '?' + query : query;
    if (this.hash) urlString += this.hash;

    return urlString;
  }
}

Url.extractProtocol = extractProtocol;
Url.location = getLocation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;
