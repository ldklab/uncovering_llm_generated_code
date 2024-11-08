'use strict';

const punycode = require('punycode/');
const querystring = require('qs');

class Url {
  constructor() {
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

  parse(url, parseQueryString, slashesDenoteHost) {
    if (typeof url !== 'string') {
      throw new TypeError(`Parameter 'url' must be a string, not ${typeof url}`);
    }
    let rest = url.trim().replace(/\\/g, '/');
    if (!slashesDenoteHost && simplePathPattern().exec(rest)) {
      this.simpleParse(rest, parseQueryString);
      return this;
    }
    this.basicParse(rest, parseQueryString, slashesDenoteHost);
    return this;
  }
  
  simpleParse(rest, parseQueryString) {
    const simplePath = simplePathPattern().exec(rest);
    this.path = rest;
    this.href = rest;
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

  basicParse(rest, parseQueryString, slashesDenoteHost) {
    let proto = protocolPattern().exec(rest);
    if (proto) {
      this.protocol = proto[0].toLowerCase();
      rest = rest.substr(proto[0].length);
    }
    
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@/]+@[^@/]+/)) {
      const slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol()[this.protocol])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol()[this.protocol] && (this.slashes || (proto && !slashedProtocol()[this.protocol]))) {
      this.parseHostPortAuth(rest);
      rest = this.parseHostname(rest);
    }

    this.handleQueryFragment(rest, parseQueryString);
    if (slashedProtocol()[this.protocol] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }
    this.href = this.format();
    return this;
  }

  parseHostPortAuth(rest) {
    let { hostEnd, auth, atSign } = { hostEnd: this.findHostEnd(rest) };
    atSign = hostEnd === -1 ? rest.lastIndexOf('@') : rest.lastIndexOf('@', hostEnd);
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }
    return rest;
  }

  findHostEnd(rest) {
    let hostEnd = -1;
    for (const hec of hostEndingChars()) {
      const pos = rest.indexOf(hec);
      if (pos !== -1 && (hostEnd === -1 || pos < hostEnd)) hostEnd = pos;
    }
    return hostEnd;
  }

  parseHostname(rest) {
    let hostEnd = this.findHostEnd(rest);
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost();
    this.hostname = this.hostname || '';
    if (!this.isIPv6()) {
      this.validateHostname();
    }
    this.host = this.hostname + (this.port ? ':' + this.port : '');
    return rest;
  }

  isIPv6() {
    if (this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']') {
      this.hostname = this.hostname.slice(1, -1);
      return true;
    }
    return false;
  }

  validateHostname() {
    const hostparts = this.hostname.split('.');
    for (let i = 0, l = hostparts.length; i < l; i++) {
      const part = hostparts[i];
      if (!part.match(hostnamePartPattern())) {
        const newpart = this.replaceInvalidChars(part);
        if (!newpart.match(hostnamePartPattern())) {
          this.buildHostname(hostparts, i, part.match(hostnamePartStart()));
          break;
        }
      }
    }
  }

  replaceInvalidChars(part) {
    let newpart = '';
    for (const char of part) {
      newpart += char.charCodeAt(0) > 127 ? 'x' : char;
    }
    return newpart;
  }

  buildHostname(hostparts, i, bit) {
    const validParts = hostparts.slice(0, i);
    const notHost = hostparts.slice(i + 1);
    if (bit) {
      validParts.push(bit[1]);
      notHost.unshift(bit[2]);
    }
    if (notHost.length) {
      this.rest = '/' + notHost.join('.') + this.rest;
    }
    this.hostname = validParts.join('.');
  }

  handleQueryFragment(rest, parseQueryString) {
    if (!unsafeProtocol()[this.protocol]) {
      for (const ae of autoEscape()) {
        if (rest.indexOf(ae) === -1) continue;
        const esc = encodeURIComponent(ae) === ae ? escape(ae) : encodeURIComponent(ae);
        rest = rest.split(ae).join(esc);
      }
    }

    const hashIndex = rest.indexOf('#');
    if (hashIndex !== -1) {
      this.hash = rest.substr(hashIndex);
      rest = rest.slice(0, hashIndex);
    }
    const queryIndex = rest.indexOf('?');
    if (queryIndex !== -1) {
      this.search = rest.substr(queryIndex);
      this.query = rest.substr(queryIndex + 1);
      if (parseQueryString) {
        this.query = querystring.parse(this.query);
      }
      rest = rest.slice(0, queryIndex);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }
    if (rest) this.pathname = rest;
  }

  format() {
    let auth = this.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth).replace(/%3A/i, ':') + '@';
    }
    let protocol = this.protocol || '',
        pathname = this.pathname || '',
        hash = this.hash || '',
        host = this.host ? auth + this.host : '';

    let query = '';
    if (this.query && typeof this.query === 'object' && Object.keys(this.query).length) {
      query = querystring.stringify(this.query, { arrayFormat: 'repeat', addQueryPrefix: false });
    }
    const search = this.search || (query && ('?' + query)) || '';
    if (protocol && protocol.substr(-1) !== ':') protocol += ':';

    host = this.slashes || (!protocol || slashedProtocol()[protocol]) && host ? '//' + (host || '') : '';
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    hash = hash && hash.charAt(0) !== '#' ? '#' + hash : hash;
    pathname = pathname.replace(/[?#]/g, match => encodeURIComponent(match));
    return protocol + host + pathname + search.replace('#', '%23') + hash;
  }

  resolve(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  }

  resolveObject(relative) {
    if (typeof relative === 'string') {
      relative = new Url().parse(relative, false, true);
    }
    const result = new Url();
    Object.assign(result, this);

    result.hash = relative.hash;
    if (!relative.href) {
      result.href = result.format();
      return result;
    }

    if (relative.slashes && !relative.protocol) {
      Object.keys(relative).forEach(key => {
        if (key !== 'protocol') result[key] = relative[key];
      });
      if (slashedProtocol()[result.protocol] && result.hostname && !result.pathname) {
        result.pathname = '/';
        result.path = result.pathname;
      }
      result.href = result.format();
      return result;
    }

    if (relative.protocol && relative.protocol !== result.protocol) {
      if (!slashedProtocol()[relative.protocol]) {
        Object.assign(result, relative);
        result.href = result.format();
        return result;
      }
      result.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol()[relative.protocol]) {
        let relPath = (relative.pathname || '').split('/');
        result.host = relPath.shift() || '';
        relPath.unshift('');
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

    this.handleRelativePaths(result, relative);
    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  handleRelativePaths(result, relative) {
    const isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
          isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
          mustEndAbs = isRelAbs || isSourceAbs || (result.host && relative.pathname),
          removeAllDots = mustEndAbs,
          srcPath = result.pathname ? result.pathname.split('/') : [],
          relPath = relative.pathname ? relative.pathname.split('/') : [],
          psychotic = result.protocol && !slashedProtocol()[result.protocol];

    if (psychotic) {
      this.handlePsychotic(result, srcPath, relative, relPath);
    } else {
      this.adjustPaths(result, srcPath, relative, relPath, removeAllDots, mustEndAbs);
    }
  }

  handlePsychotic(result, srcPath, relative, relPath) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') {
        srcPath[0] = result.host;
      } else {
        srcPath.unshift(result.host);
      }
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
    this.adjustPaths(result, srcPath, relative, relPath, true, true);
  }

  adjustPaths(result, srcPath, relative, relPath, removeAllDots, mustEndAbs) {
    if (isRelativeAbs()) {
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
    } else if (relative.search !== null) {
      result.search = relative.search;
      result.query = relative.query;
      if (result.pathname !== null || result.search !== null) {
        result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
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

    this.pathDotResolution(srcPath, removeAllDots);
    result.pathname = srcPath.join('/') || null;
    if (mustEndAbs && !isAbsolute()) {
      srcPath.unshift('');
    }
    result.pathname = srcPath.join('/') || null;
  }

  pathDotResolution(srcPath, removeAllDots) {
    let last = srcPath.slice(-1)[0];
    const hasTrailingSlash = last === '.' || last === '..' || last === '';
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
    if (!removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }
    if (srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }
    if (hasTrailingSlash && srcPath.join('/').slice(-1) !== '/') {
      srcPath.push('');
    }
  }

  parseHost() {
    const portMatch = portPattern().exec(this.host);
    if (portMatch) {
      this.port = portMatch.pop().substr(1);
      this.host = this.host.slice(0, this.host.length - portMatch.length);
    }
    if (this.host) {
      this.hostname = this.host;
    }
  }
}

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof url === 'object' && url instanceof Url) {
    return url;
  }
  return new Url().parse(url, parseQueryString, slashesDenoteHost);
}

function urlFormat(obj) {
  return (typeof obj === 'string') ? urlParse(obj).format() : obj.format();
}

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

function urlResolveObject(source, relative) {
  return urlParse(source, false, true).resolveObject(urlParse(relative, false, true));
}

const protocolPattern = () => /^([a-z0-9.+-]+:)/i;
const portPattern = () => /:[0-9]*$/;
const simplePathPattern = () => /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/;
const hostEndingChars = () => ['/', '?', '#'];
const hostnamePartPattern = () => /^[+a-z0-9A-Z_-]{0,63}$/;
const hostnamePartStart = () => /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
// Escaped & Unescaped delimiting characters
const delims = () => ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
const unwise = () => ['{', '}', '|', '\\', '^', '`', ...delims()];
const autoEscape = () => ['\'', ...unwise()];
const nonHostChars = () => ['%', '/', '?', ';', '#', ...autoEscape()];
const unsafeProtocol = () => ({ javascript: true, 'javascript:': true });
const hostlessProtocol = () => ({ javascript: true, 'javascript:': true });
const slashedProtocol = () => ({ http: true, https: true, ftp: true, gopher: true, file: true, 'http:': true, 'https:': true, 'ftp:': true, 'gopher:': true, 'file:': true });

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;
exports.Url = Url;
