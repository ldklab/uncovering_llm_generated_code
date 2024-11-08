'use strict';

const punycode = require('punycode');
const util = require('./util');
const querystring = require('querystring');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;
exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

const protocolPattern = /^([a-z0-9.+-]+:)/i;
const portPattern = /:[0-9]*$/;
const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
const unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
const autoEscape = ['\''].concat(unwise);
const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
const hostEndingChars = ['/', '?', '#'];
const hostnameMaxLen = 255;
const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
const unsafeProtocol = { 'javascript': true, 'javascript:': true };
const hostlessProtocol = { 'javascript': true, 'javascript:': true };
const slashedProtocol = {
  'http': true, 'https': true, 'ftp': true, 'gopher': true, 'file': true,
  'http:': true, 'https:': true, 'ftp:': true, 'gopher:': true, 'file:': true
};

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  const u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError(`Parameter 'url' must be a string, not ${typeof url}`);
  }

  let questionMarkIndex = url.indexOf('?');
  let hashDelimiter = (questionMarkIndex !== -1 && questionMarkIndex < url.indexOf('#')) ? '?' : '#';
  let urlParts = url.split(hashDelimiter).map(part => part.replace(/\\/g, '/'));
  url = urlParts.join(hashDelimiter);
  let remainingUrl = url.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    let simplePath = simplePathPattern.exec(remainingUrl);
    if (simplePath) {
      this.path = remainingUrl;
      this.href = remainingUrl;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        this.query = parseQueryString ? querystring.parse(this.search.substr(1)) : this.search.substr(1);
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  let protocolMatch = protocolPattern.exec(remainingUrl);
  if (protocolMatch) {
    this.protocol = protocolMatch[0].toLowerCase();
    remainingUrl = remainingUrl.substr(this.protocol.length);
  }

  let hasHost = slashesDenoteHost || this.protocol || /^\/\/[^@\/]+@[^@\/]+/.test(remainingUrl);
  if (hasHost) {
    let slashes = remainingUrl.startsWith('//');
    if (slashes && !(this.protocol && hostlessProtocol[this.protocol])) {
      remainingUrl = remainingUrl.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[this.protocol] && (slashes || (this.protocol && !slashedProtocol[this.protocol]))) {
    let endOfHost = -1;
    for (const char of hostEndingChars) {
      const idx = remainingUrl.indexOf(char);
      if (idx !== -1 && (endOfHost === -1 || idx < endOfHost)) endOfHost = idx;
    }

    let atSign = endOfHost === -1 ? remainingUrl.lastIndexOf('@') : remainingUrl.lastIndexOf('@', endOfHost);
    if (atSign !== -1) {
      this.auth = decodeURIComponent(remainingUrl.slice(0, atSign));
      remainingUrl = remainingUrl.slice(atSign + 1);
    }

    endOfHost = -1;
    for (const char of nonHostChars) {
      const idx = remainingUrl.indexOf(char);
      if (idx !== -1 && (endOfHost === -1 || idx < endOfHost)) endOfHost = idx;
    }
    this.host = remainingUrl.slice(0, endOfHost);
    remainingUrl = remainingUrl.slice(endOfHost);

    this.parseHost();
    this.hostname = this.hostname || '';

    const isIPv6 = this.hostname.startsWith('[') && this.hostname.endsWith(']');
    if (!isIPv6) {
      const parts = this.hostname.split('.');
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        if (!hostnamePartPattern.test(part)) {
          const newPart = [...part].map(c => c.charCodeAt(0) > 127 ? 'x' : c).join('');
          if (!hostnamePartPattern.test(newPart)) {
            const validParts = parts.slice(0, i);
            const notHost = parts.slice(i + 1);
            const match = hostnamePartStart.exec(part);
            if (match) {
              validParts.push(match[1]);
              notHost.unshift(match[2]);
            }
            if (notHost.length) remainingUrl = '/' + notHost.join('.') + remainingUrl;
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) this.hostname = '';
    else this.hostname = this.hostname.toLowerCase();

    if (!isIPv6) this.hostname = punycode.toASCII(this.hostname);
    this.host = this.hostname + (this.port ? `:${this.port}` : '');
    this.href += this.host;

    if (isIPv6) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (remainingUrl[0] !== '/') remainingUrl = '/' + remainingUrl;
    }
  }

  if (!unsafeProtocol[this.protocol]) {
    for (const char of autoEscape) {
      if (remainingUrl.includes(char)) {
        remainingUrl = remainingUrl.split(char).join(encodeURIComponent(char));
      }
    }
  }

  let hashIndex = remainingUrl.indexOf('#');
  if (hashIndex !== -1) {
    this.hash = remainingUrl.substr(hashIndex);
    remainingUrl = remainingUrl.slice(0, hashIndex);
  }
  let queryMark = remainingUrl.indexOf('?');
  if (queryMark !== -1) {
    this.search = remainingUrl.substr(queryMark);
    this.query = remainingUrl.substr(queryMark + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    remainingUrl = remainingUrl.slice(0, queryMark);
  } else if (parseQueryString) {
    this.search = '';
    this.query = {};
  }
  if (remainingUrl) this.pathname = remainingUrl;
  if (slashedProtocol[this.protocol] && this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  if (this.pathname || this.search) {
    this.path = (this.pathname || '') + (this.search || '');
  }

  this.href = this.format();
  return this;
};

function urlFormat(obj) {
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  const auth = this.auth ? encodeURIComponent(this.auth).replace(/%3A/i, ':') + '@' : '';
  const protocol = this.protocol || '';
  let pathname = this.pathname || '';
  const hash = this.hash || '';
  let host = false;
  let query = util.isObject(this.query) && Object.keys(this.query).length ? querystring.stringify(this.query) : '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : `[${this.hostname}]`);
    if (this.port) {
      host += ':' + this.port;
    }
  }

  const search = this.search || (query && '?' + query) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname[0] !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash[0] !== '#') hash = '#' + hash;
  if (search && search[0] !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, match => encodeURIComponent(match));
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    const rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  const result = new Url();
  const keys = Object.keys(this);
  for (const key of keys) result[key] = this[key];
  result.hash = relative.hash;

  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  if (relative.slashes && !relative.protocol) {
    const relKeys = Object.keys(relative);
    for (const key of relKeys) {
      if (key !== 'protocol') result[key] = relative[key];
    }

    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    if (!slashedProtocol[relative.protocol]) {
      const relKeys = Object.keys(relative);
      for (const key of relKeys) result[key] = relative[key];
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      const relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    if (result.pathname || result.search) {
      result.path = (result.pathname || '') + (result.search || '');
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  const isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/');
  const isRelAbs = (relative.host || relative.pathname && relative.pathname.charAt(0) === '/');
  const mustEndAbs = (isRelAbs || isSourceAbs || (result.host && relative.pathname));
  const removeAllDots = mustEndAbs;
  let srcPath = result.pathname && result.pathname.split('/') || [];
  let relPath = relative.pathname && relative.pathname.split('/') || [];
  const psychotic = result.protocol && !slashedProtocol[result.protocol];

  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    result.host = relative.host || relative.host === '' ? relative.host : result.host;
    result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
  } else if (relPath.length) {
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      const authInHost = result.host && result.host.indexOf('@') > 0
        ? result.host.split('@')
        : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    result.pathname = null;
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  let last = srcPath.slice(-1)[0];
  const hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  let up = 0;
  for (let i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  const isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
    const authInHost = result.host && result.host.indexOf('@') > 0
      ? result.host.split('@')
      : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  const port = portPattern.exec(this.host);
  if (port) {
    if (port !== ':') {
      this.port = port[0].substr(1);
    }
    this.host = this.host.substr(0, this.host.length - port[0].length);
  }
  if (this.host) this.hostname = this.host;
};
