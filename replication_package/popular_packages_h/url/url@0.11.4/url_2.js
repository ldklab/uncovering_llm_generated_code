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
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }

    let rest = url.trim();

    const simplePath = simplePathPattern.exec(rest);
    if (!slashesDenoteHost && simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      this.search = simplePath[2] || '';
      this.query = parseQueryString ? querystring.parse(this.search.substr(1)) : this.search.substr(1);
      return this;
    }

    const proto = protocolPattern.exec(rest);
    if (proto) {
      this.protocol = proto[0].toLowerCase();
      rest = rest.substr(proto[0].length);
    }

    const slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }

    const hostEnd = this.getHostEnd(rest);
    const authAt = hostEnd !== -1 ? rest.lastIndexOf('@', hostEnd) : rest.lastIndexOf('@');
    if (authAt !== -1) {
      this.auth = decodeURIComponent(rest.slice(0, authAt));
      rest = rest.slice(authAt + 1);
    }

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost();

    if (!this.hostname) this.hostname = '';
    if (!this.isIPv6()) {
      this.validateHostName();
    }

    if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
      this.hostname = this.hostname.toLowerCase();
      if (!this.isIPv6()) {
        this.hostname = punycode.toASCII(this.hostname);
      }
      this.host = this.hostname + (this.port ? ':' + this.port : '');
      this.href += this.host;
    }

    if (!unsafeProtocol[proto]) {
      autoEscape.forEach(ae => rest = rest.split(ae).join(encodeURIComponent(ae)));
    }

    const hashIndex = rest.indexOf('#');
    if (hashIndex !== -1) {
      this.hash = rest.substr(hashIndex);
      rest = rest.slice(0, hashIndex);
    }

    const qmIndex = rest.indexOf('?');
    if (qmIndex !== -1) {
      this.search = rest.substr(qmIndex);
      this.query = parseQueryString ? querystring.parse(this.search.substr(1)) : this.search.substr(1);
      rest = rest.slice(0, qmIndex);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }

    if (rest) this.pathname = rest;
    if (slashedProtocol[proto] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }

    if (this.pathname || this.search) {
      this.path = (this.pathname || '') + this.search;
    }

    this.href = this.format();
    return this;
  }

  getHostEnd(rest) {
    let hostEnd = -1;
    nonHostChars.forEach(char => {
      const hec = rest.indexOf(char);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    });
    return hostEnd === -1 ? rest.length : hostEnd;
  }

  isIPv6() {
    return this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';
  }

  validateHostName() {
    const hostparts = this.hostname.split(/\./);
    for (let i = 0; i < hostparts.length; i++) {
      let part = hostparts[i];
      if (!part.match(hostnamePartPattern)) {
        part = part.replace(/[^\x00-\x7F]/g, 'x');
        if (!part.match(hostnamePartPattern)) {
          this.hostname = hostparts.slice(0, i).concat(hostparts.slice(i + 1)).join('.');
          break;
        }
      }
    }
    this.hostname = this.hostname.length > hostnameMaxLen ? '' : this.hostname;
  }

  format() {
    const auth = this.auth ? encodeURIComponent(this.auth).replace(/%3A/i, ':') + '@' : '';
    const protocol = (this.protocol || '') + ((this.slashes || (!this.protocol || slashedProtocol[this.protocol])) && this.host !== false ? '//' : '');
    const pathname = (this.pathname || '').replace(/[?#]/g, encodeURIComponent);
    const search = this.search ? this.search.replace('#', '%23') : '';
    const hash = this.hash ? (this.hash.charAt(0) !== '#' ? '#' + this.hash : this.hash) : '';

    return protocol + auth + (this.host || '') + pathname + search + hash;
  }

  parseHost() {
    const portMatch = portPattern.exec(this.host);
    if (portMatch) {
      this.port = portMatch[0].substr(1);
      this.hostname = this.host.substring(0, this.host.length - portMatch[0].length);
    } else {
      this.hostname = this.host;
    }
  }

  resolve(relative) {
    return this.resolveObject(new Url().parse(relative, false, true)).format();
  }

  resolveObject(relative) {
    if (typeof relative === 'string') {
      relative = new Url().parse(relative, false, true);
    }

    const result = new Url();
    result.hash = relative.hash;

    if (relative.href === '') {
      result.href = result.format();
      return result;
    }

    if (relative.slashes && !relative.protocol) {
      Object.keys(relative).forEach(key => {
        if (key !== 'protocol') result[key] = relative[key];
      });
      if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
        result.pathname = '/';
        result.path = result.pathname;
      }
      result.href = result.format();
      return result;
    }

    if (relative.protocol && relative.protocol !== result.protocol) {
      if (!slashedProtocol[relative.protocol]) {
        Object.keys(relative).forEach(key => result[key] = relative[key]);
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
        result.pathname = relPath.join('/');
      } else {
        result.pathname = relative.pathname;
      }
      result.search = relative.search;
      result.query = relative.query;
      result.auth = relative.auth;
      result.host = relative.host || '';
      result.hostname = relative.hostname || relative.host;
      result.port = relative.port;
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    }

    const srcPath = result.pathname && result.pathname.split('/') || [];
    const relPath = relative.pathname && relative.pathname.split('/') || [];
    result.search = relative.search || result.search;
    result.query = relative.query || result.query;

    if (relative.host || relative.pathname && relative.pathname.charAt(0) === '/') {
      result.host = relative.host || result.host;
      result.hostname = relative.hostname || result.hostname;
      result.port = relative.port || result.port;
      result.pathname = relPath.join('/');
      result.href = result.format();
      return result;
    }

    if (relPath.length) {
      srcPath.pop();
      srcPath.push(...relPath);
    }
  
    const isAbsolute = srcPath[0] === '' || srcPath[0].charAt(0) === '/';
    let i = srcPath.length;
    while (i--) {
      if (srcPath[i] === '.') {
        srcPath.splice(i, 1);
      } else if (srcPath[i] === '..') {
        srcPath.splice(i, 1);
        let j = i;
        while (j-- > 0 && srcPath[j] === '..');
        if (j >= 0) srcPath.splice(j, 1);
      }
    }

    result.pathname = isAbsolute ? '/' + srcPath.join('/') : srcPath.join('/');
    result.path = (result.pathname || '') + (result.search || '');
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }
}

function urlParse(url, parseQueryString = false, slashesDenoteHost = false) {
  return (url && typeof url === 'object' && url instanceof Url) ? url : new Url().parse(url, parseQueryString, slashesDenoteHost);
}

function urlFormat(obj) {
  return typeof obj === 'string' ? urlParse(obj).format() : (obj instanceof Url ? obj.format() : Url.prototype.format.call(obj));
}

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;
exports.Url = Url;

const protocolPattern = /^([a-z0-9.+-]+:)/i;
const portPattern = /:[0-9]*$/;
const simplePathPattern = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/;
const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
const unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
const autoEscape = ["'"].concat(unwise);
const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
const hostEndingChars = ['/', '?', '#'];
const hostnameMaxLen = 255;
const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
const unsafeProtocol = { javascript: true, 'javascript:': true };
const hostlessProtocol = { javascript: true, 'javascript:': true };
const slashedProtocol = { http: true, https: true, ftp: true, gopher: true, file: true, 'http:': true, 'https:': true, 'ftp:': true, 'gopher:': true, 'file:': true };
