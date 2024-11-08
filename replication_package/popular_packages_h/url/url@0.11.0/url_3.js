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
  return u.parse(url, parseQueryString, slashesDenoteHost);
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  let queryIndex = url.indexOf('?');
  let splitter = (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#';
  let uSplit = url.split(splitter);
  let slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);
  let rest = url.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    let simplePath = simplePathPattern.exec(rest);
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

  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    this.protocol = proto.toLowerCase();
    rest = rest.substr(proto.length);
  }

  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    let slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
    let hostEnd = -1;
    for (let i = 0; i < hostEndingChars.length; i++) {
      let hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }
    let atSign = hostEnd === -1 ? rest.lastIndexOf('@') : rest.lastIndexOf('@', hostEnd);
    if (atSign !== -1) {
      this.auth = decodeURIComponent(rest.slice(0, atSign));
      rest = rest.slice(atSign + 1);
    }

    hostEnd = -1;
    for (let i = 0; i < nonHostChars.length; i++) {
      let hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }
    if (hostEnd === -1) hostEnd = rest.length;
    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost();
    this.hostname = this.hostname || '';
    let ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

    if (!ipv6Hostname) {
      let hostparts = this.hostname.split(/\./);
      for (let i = 0, l = hostparts.length; i < l; i++) {
        let part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          let newpart = '';
          for (let j = 0, k = part.length; j < k; j++) {
            newpart += part.charCodeAt(j) > 127 ? 'x' : part[j];
          }
          if (!newpart.match(hostnamePartPattern)) {
            let validParts = hostparts.slice(0, i);
            let notHost = hostparts.slice(i + 1);
            let bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) rest = '/' + notHost.join('.') + rest;
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      this.hostname = punycode.toASCII(this.hostname);
    }

    let p = this.port ? ':' + this.port : '';
    let h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') rest = '/' + rest;
    }
  }

  if (!unsafeProtocol[lowerProto]) {
    for (let i = 0, l = autoEscape.length; i < l; i++) {
      let ae = autoEscape[i];
      if (rest.indexOf(ae) === -1) continue;
      let esc = encodeURIComponent(ae);
      if (esc === ae) esc = escape(ae);
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
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) this.pathname = '/';
  if (this.pathname || this.search) this.path = (this.pathname || '') + (this.search || '');
  this.href = this.format();
  return this;
};

function urlFormat(obj) {
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  let auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth).replace(/%3A/i, ':') + '@';
  }

  let protocol = this.protocol || '';
  let pathname = this.pathname || '';
  let hash = this.hash || '';
  let host = false;
  let query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
    if (this.port) host += ':' + this.port;
  }

  if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  let search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

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
    let rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  let result = new Url();
  let tkeys = Object.keys(this);
  for (let tk = 0; tk < tkeys.length; tk++) {
    let tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  result.hash = relative.hash;

  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  if (relative.slashes && !relative.protocol) {
    let rkeys = Object.keys(relative);
    for (let rk = 0; rk < rkeys.length; rk++) {
      let rkey = rkeys[rk];
      if (rkey !== 'protocol') result[rkey] = relative[rkey];
    }
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) result.path = result.pathname = '/';
    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    if (!slashedProtocol[relative.protocol]) {
      let keys = Object.keys(relative);
      for (let v = 0; v < keys.length; v++) {
        let k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }
    
    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      let relPath = (relative.pathname || '').split('/');
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
      let p = result.pathname || '';
      let s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  let isSourceAbs = result.pathname && result.pathname.charAt(0) === '/';
  let isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/';
  let mustEndAbs = isRelAbs || isSourceAbs || (result.host && relative.pathname);
  let removeAllDots = mustEndAbs;
  let srcPath = result.pathname && result.pathname.split('/') || [];
  let relPath = relative.pathname && relative.pathname.split('/') || [];
  let psychotic = result.protocol && !slashedProtocol[result.protocol];

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
      let authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
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

  let last = srcPath.slice(-1)[0];
  let hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

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

  let isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');

  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
    let authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
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
    result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  let host = this.host;
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') this.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};
