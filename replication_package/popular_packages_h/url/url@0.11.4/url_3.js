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

    let rest = url.trim().replace(/\\/g, '/');

    if (!slashesDenoteHost && rest.split('#').length === 1) {
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
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
    }

    const proto = protocolPattern.exec(rest);
    if (proto) {
      this.protocol = proto[0].toLowerCase();
      rest = rest.substr(proto[0].length);
    }

    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@/]+@[^@/]+/)) {
      const slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[this.protocol])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[this.protocol] && (this.slashes || (proto && !slashedProtocol[this.protocol]))) {
      let hostEnd = -1;
      for (const char of hostEndingChars) {
        const hec = rest.indexOf(char);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }

      let auth, atSign;
      if (hostEnd === -1) atSign = rest.lastIndexOf('@');
      else atSign = rest.lastIndexOf('@', hostEnd);

      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = decodeURIComponent(auth);
      }

      hostEnd = -1;
      for (const char of nonHostChars) {
        const hec = rest.indexOf(char);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }
      if (hostEnd === -1) hostEnd = rest.length;
      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);
      this.parseHost();
      this.hostname = this.hostname || '';

      if (!this.hostname.startsWith('[') || !this.hostname.endsWith(']')) {
        const hostparts = this.hostname.split('.');
        for (let i = 0; i < hostparts.length; i++) {
          const part = hostparts[i];
          if (!part.match(hostnamePartPattern)) {
            let newpart = '';
            for (let j = 0; j < part.length; j++) {
              if (part.charCodeAt(j) > 127) newpart += 'x';
              else newpart += part[j];
            }
            if (!newpart.match(hostnamePartPattern)) {
              const validParts = hostparts.slice(0, i);
              const bit = part.match(hostnamePartStart);
              if (bit) validParts.push(bit[1]);
              const notHost = hostparts.slice(i + 1);
              if (notHost.length) rest = '/' + notHost.join('.') + rest;
              this.hostname = validParts.join('.');
              break;
            }
          }
        }
      }

      if (this.hostname.length > hostnameMaxLen) this.hostname = '';
      else this.hostname = this.hostname.toLowerCase();

      this.hostname = punycode.toASCII(this.hostname);

      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') rest = '/' + rest;
      } 

      this.host = this.hostname;
      this.href += this.host;

      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') rest = '/' + rest;
      }
    }

    if (!unsafeProtocol[this.protocol]) {
      for (const ae of autoEscape) {
        if (rest.includes(ae)) {
          const esc = encodeURIComponent(ae);
          rest = rest.split(ae).join(esc);
        }
      }
    }

    const hash = rest.indexOf('#');
    if (hash !== -1) {
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    const qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      this.query = rest.substr(qm + 1);
      if (parseQueryString) {
        this.query = querystring.parse(this.query);
      }
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }
    if (rest) this.pathname = rest;
    if (slashedProtocol[this.protocol] && this.hostname && !this.pathname) this.pathname = '/';

    if (this.pathname || this.search) this.path = this.pathname + this.search;
    this.href = this.format();
    return this;
  }
  
  format() {
    const auth = this.auth ? encodeURIComponent(this.auth).replace(/%3A/i, ':') + '@' : '';
    const protocol = this.protocol || '';
    const pathname = this.pathname || '';
    const hash = this.hash || '';
    let host = false;
    let query = '';
    if (this.host) host = auth + this.host;
    else if (this.hostname) {
      host = auth + (this.hostname.includes(':') ? `[${this.hostname}]` : this.hostname);
      if (this.port) host += ':' + this.port;
    }
    if (this.query && typeof this.query === 'object' && Object.keys(this.query).length) {
      query = querystring.stringify(this.query, { arrayFormat: 'repeat', addQueryPrefix: false });
    }

    const search = this.search || (query && ('?' + query)) || '';
    host = slashedProtocol[protocol] && host !== false ? '//' + (host || '') : '';
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    return protocol + host + pathname.replace(/[?#]/g, encodeURIComponent) + (search && search.charAt(0) !== '?' ? '?' + search : search) + hash;
  }
  
  parseHost() {
    const host = this.host;
    const port = portPattern.exec(host);
    if (port) {
      this.port = port[0].substr(1);
      this.hostname = host.substr(0, host.length - port[0].length);
    } else {
      this.hostname = host;
    }
  }

  resolve(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  }

  resolveObject(relative) {
    if (typeof relative === 'string') relative = urlParse(relative, false, true);

    const result = new Url();

    Object.keys(this).forEach(tkey => result[tkey] = this[tkey]);
    
    if (relative.href === '') {
      result.href = result.format();
      return result;
    }

    result.hash = relative.hash;

    if (relative.slashes && !relative.protocol) {
      Object.keys(relative).forEach(rkey => {
        if (rkey !== 'protocol') result[rkey] = relative[rkey];
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
        Object.assign(result, relative);
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
      if (result.pathname || result.search) result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    }

    const isSourceAbs = result.pathname && result.pathname.charAt(0) === '/';
    const isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/';
    const mustEndAbs = isRelAbs || isSourceAbs || (result.host && relative.pathname);
    const removeAllDots = mustEndAbs;

    let srcPath = result.pathname && result.pathname.split('/') || [];
    const relPath = relative.pathname && relative.pathname.split('/') || [];
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
    } else if (relative.search != null) {
      if (psychotic) {
        result.host = srcPath.shift();
        result.hostname = result.host;
        const authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
        if (authInHost) {
          result.auth = authInHost.shift();
          result.hostname = authInHost.shift();
          result.host = result.hostname;
        }
      }
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
      if (result.search) result.path = '/' + result.search;
      else result.path = null;
      result.href = result.format();
      return result;
    }

    const last = srcPath.slice(-1)[0];
    const hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '';

    let up = 0;
    for (let i = srcPath.length; i >= 0; i--) {
      last = srcPath[i];
      if (last === '.') srcPath.splice(i, 1);
      else if (last === '..') {
        srcPath.splice(i, 1); 
        up++;
      } else if (up) {
        srcPath.splice(i, 1);
        up--;
      }
    }

    if (!mustEndAbs && !removeAllDots) {
      while (up--) srcPath.unshift('..');
    }

    if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }

    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
      srcPath.push('');
    }

    const isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');

    if (psychotic) {
      result.hostname = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
      result.host = result.hostname;
      const authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.hostname = authInHost.shift();
        result.host = result.hostname;
      }
    }

    mustEndAbs = mustEndAbs || (result.host && srcPath.length);

    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }

    if (srcPath.length > 0) result.pathname = srcPath.join('/');
    else {
      result.pathname = null;
      result.path = null;
    }

    if (result.pathname !== null || result.search !== null) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }

    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }
}

const protocolPattern = /^([a-z0-9.+-]+:)/i;
const portPattern = /:[0-9]*$/;
const simplePathPattern = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/;
const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
const unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
const autoEscape = ['\''].concat(unwise);
const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
const hostEndingChars = ['/', '?', '#'];
const hostnameMaxLen = 255;
const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
const unsafeProtocol = { javascript: true, 'javascript:': true };
const hostlessProtocol = { javascript: true, 'javascript:': true };
const slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
};

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof url === 'object' && url instanceof Url) {
    return url;
  }
  const u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

function urlFormat(obj) {
  if (typeof obj === 'string') {
    obj = urlParse(obj);
  }
  if (!(obj instanceof Url)) {
    return Url.prototype.format.call(obj);
  }
  return obj.format();
}

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;
exports.Url = Url;
