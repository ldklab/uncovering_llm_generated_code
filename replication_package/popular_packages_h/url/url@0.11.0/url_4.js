'use strict';

const punycode = require('punycode');
const querystring = require('querystring');
const util = require('./util');

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
    if (!util.isString(url)) {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }

    // Normalize backslashes, handle space trimming
    let rest = url.trim().replace(/\\/g, '/');

    if (!slashesDenoteHost && !rest.includes('#')) {
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.path = this.href = rest;
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

    const proto = protocolPattern.exec(rest);
    if (proto) {
      this.protocol = proto[0].toLowerCase();
      rest = rest.substr(proto.length);
    }

    // Check for host existence
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      const hasSlashes = rest.startsWith('//');
      if (hasSlashes && (!proto || !hostlessProtocol[this.protocol])) {
        this.slashes = true;
        rest = rest.substr(2);
      }
    }

    if (!hostlessProtocol[this.protocol] && (slashes || (proto && !slashedProtocol[this.protocol]))) {
      let hostEnd = -1;
      
      for (let i = 0; i < hostEndingChars.length; i++) {
        const hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }

      const atSign = (hostEnd === -1) ? rest.lastIndexOf('@') : rest.lastIndexOf('@', hostEnd);

      // Extract auth
      if (atSign !== -1) {
        this.auth = decodeURIComponent(rest.slice(0, atSign));
        rest = rest.slice(atSign + 1);
      }

      hostEnd = -1;
      for (let i = 0; i < nonHostChars.length; i++) {
        const hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }

      if (hostEnd === -1) hostEnd = rest.length;

      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      this.parseHost();
      this.hostname = this.hostname.toLowerCase();

      if (!ipv6Hostname) this.hostname = punycode.toASCII(this.hostname);

      const p = this.port ? ':' + this.port : '';
      this.host = this.hostname + p;
      this.href += this.host;

      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') rest = '/' + rest;
      }
    }

    if (!unsafeProtocol[lowerProto]) {
      for (let i = 0; i < autoEscape.length; i++) {
        const ae = autoEscape[i];
        if (rest.indexOf(ae) === -1) continue;
        const esc = encodeURIComponent(ae) === ae ? escape(ae) : encodeURIComponent(ae);
        rest = rest.split(ae).join(esc);
      }
    }
    
    let hash = rest.indexOf('#');
    if (hash !== -1) {
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }

    let qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      this.query = rest.substr(qm + 1);
      if (parseQueryString) this.query = querystring.parse(this.query);
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }

    if (rest) this.pathname = rest;
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }

    if (this.pathname || this.search) {
      this.path = this.pathname + this.search;
    }

    this.href = this.format();
    return this;
  }

  format() {
    const auth = this.auth ? encodeURIComponent(this.auth).replace(/%3A/i, ':') + '@' : '';
    const protocol = this.protocol || '';
    const pathname = this.pathname || '';
    const hash = this.hash || '';
    const host = this.host || '';
    let query = this.query && util.isObject(this.query) && Object.keys(this.query).length ? querystring.stringify(this.query) : '';
    const search = this.search || (query && ('?' + query)) || '';

    if (protocol && !protocol.endsWith(':')) protocol += ':';
    const slashes = (this.slashes || (!protocol || slashedProtocol[protocol]) && host) ? '//' : '';
    let resultPathname = pathname.replace(/[?#]/g, encodeURIComponent);
    const resultSearch = search.replace('#', '%23');
    resultPathname = slashes && resultPathname.charAt(0) !== '/' ? '/' + resultPathname : resultPathname;
    return protocol + slashes + auth + host + resultPathname + resultSearch + hash;
  }
  
  parseHost() {
    const port = this.host.match(portPattern);
    if (port) {
      port = port[0];
      if (port !== ':') this.port = port.substr(1);
      this.hostname = this.host.substr(0, this.host.length - port.length);
    } else {
      this.hostname = this.host;
    }
  }
}

function urlParse(url, parseQueryString = false, slashesDenoteHost = false) {
  return (url instanceof Url) ? url : new Url().parse(url, parseQueryString, slashesDenoteHost);
}

function urlFormat(obj) {
  return (util.isString(obj)) ? urlParse(obj).format() : obj.format();
}

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(urlParse(relative, false, true));
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) relative = new Url().parse(relative, false, true);

  const result = new Url();
  Object.assign(result, this, {
    hash: relative.hash,
    pathname: (relative.pathname !== null && relative.pathname !== undefined) ? relative.pathname : this.pathname,
    search: (relative.search !== null && relative.search !== undefined) ? relative.search : this.search,
    query: (relative.query && Object.keys(relative.query).length) ? relative.query : this.query,
    auth: relative.auth || this.auth,
    host: (relative.host !== null && relative.host !== undefined) ? relative.host : this.host,
    hostname: (relative.hostname !== null && relative.hostname !== undefined) ? relative.hostname : this.hostname,
    port: (relative.port !== null && relative.port !== undefined) ? relative.port : this.port,
    slashes: relative.slashes || this.slashes || (result.protocol && slashedProtocol[result.protocol]),
  });
  
  result.href = result.format();
  return result;
};

// Regular expressions and default protocols
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
  'http': true,
  'https': true,
  'ftp': true,
  'gopher': true,
  'file': true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
};

module.exports = {
  parse: urlParse,
  resolve: urlResolve,
  resolveObject: urlResolveObject,
  format: urlFormat,
  Url
};
