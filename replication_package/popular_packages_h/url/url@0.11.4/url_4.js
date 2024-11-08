'use strict';

var punycode = require('punycode/');
var querystring = require('qs');

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

    var rest = url.trim();
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      this.protocol = proto.toLowerCase();
      rest = rest.substr(proto.length);
    }

    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@/]+@[^@/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
      var hostEnd = this.findFirstHostEndingChar(rest);
      var atSign = hostEnd === -1 ? rest.lastIndexOf('@') : rest.lastIndexOf('@', hostEnd);
      
      if (atSign !== -1) {
        this.auth = decodeURIComponent(rest.slice(0, atSign));
        rest = rest.slice(atSign + 1);
      }

      hostEnd = this.findNonHostChar(rest);
      if (hostEnd === -1) hostEnd = rest.length;

      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      this.parseHost();

      this.hostname = this.hostname || '';

      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = '';
      } else {
        this.hostname = this.hostname.toLowerCase();
      }

      if (!this.isIPv6()) {
        this.hostname = punycode.toASCII(this.hostname);
      }
      
      var p = this.port ? `:${this.port}` : '';
      this.host += p;
      this.href += this.host;

      if (this.isIPv6() && rest[0] !== '/') {
        rest = `/${rest}`;
      }
    }

    if (!unsafeProtocol[this.protocol]) {
      autoEscape.forEach(ae => {
        if (rest.indexOf(ae) === -1) return;
        var esc = encodeURIComponent(ae);
        rest = rest.split(ae).join(esc === ae ? escape(ae) : esc);
      });
    }

    var hash = rest.indexOf('#');
    if (hash !== -1) {
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }

    var qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      this.query = this.search.substr(1);
      if (parseQueryString) this.query = querystring.parse(this.query);
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }
    
    if (rest) this.pathname = rest;

    if (slashedProtocol[this.protocol] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }

    if (this.pathname || this.search) {
      this.path = (this.pathname ? this.pathname : '') + (this.search ? this.search : '');
    }

    this.href = this.format();
    return this;
  }

  format() {
    var auth = this.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth).replace(/%3A/i, ':') + '@';
    }

    var protocol = this.protocol || '';
    var pathname = this.pathname || '';
    var hash = this.hash || '';
    var host = false;
    var query = '';

    if (this.host) {
      host = auth + this.host;
    } else if (this.hostname) {
      host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : `[${this.hostname}]`);
      if (this.port) host += `:${this.port}`;
    }

    if (this.query && typeof this.query === 'object' && Object.keys(this.query).length) {
      query = querystring.stringify(this.query, { arrayFormat: 'repeat', addQueryPrefix: false });
    }

    var search = this.search || (query && `?${query}`) || '';

    if (protocol && protocol.substr(-1) !== ':') protocol += ':';

    if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = `//${host || ''}`;
      if (pathname && pathname.charAt(0) !== '/') pathname = `/${pathname}`;
    } else if (!host) host = '';

    if (hash && hash.charAt(0) !== '#') hash = `#${hash}`;
    if (search && search.charAt(0) !== '?') search = `?${search}`;

    pathname = pathname.replace(/[?#]/g, match => encodeURIComponent(match));
    search = search.replace('#', '%23');

    return `${protocol}${host}${pathname}${search}${hash}`;
  }

  resolve(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  }

  resolveObject(relative) {
    if (typeof relative === 'string') {
      var rel = new Url();
      rel.parse(relative, false, true);
      relative = rel;
    }

    var result = Object.assign(new Url(), this);
    result.hash = relative.hash;

    if (relative.href === '') {
      result.href = result.format();
      return result;
    }

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
        Object.keys(relative).forEach(k => result[k] = relative[k]);
        result.href = result.format();
        return result;
      }

      result.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift())) {}
        relative.hostname = relative.hostname || '';
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
        var p = result.pathname || '';
        var s = result.search || '';
        result.path = p + s;
      }
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    }

    var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/';
    var isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/';
    var mustEndAbs = isRelAbs || isSourceAbs || (result.host && relative.pathname);
    var removeAllDots = mustEndAbs;
    var srcPath = result.pathname && result.pathname.split('/') || [];
    var relPath = relative.pathname && relative.pathname.split('/') || [];
    var psychotic = result.protocol && !slashedProtocol[result.protocol];

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
        
        var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
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
      if (result.search) {
        result.path = '/' + result.search;
      } else {
        result.path = null;
      }
      result.href = result.format();
      return result;
    }

    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
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

    var isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');

    if (psychotic) {
      result.hostname = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
      result.host = result.hostname;
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
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

    if (srcPath.length > 0) {
      result.pathname = srcPath.join('/');
    } else {
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

  parseHost() {
    var host = this.host;
    var port = portPattern.exec(host);
    if (port) {
      this.port = port[0] !== ':' ? port.substr(1) : null;
      host = host.substr(0, host.length - port.length);
    }
    if (host) this.hostname = host;
  }

  findFirstHostEndingChar(rest) {
    var hostEnd = -1;
    hostEndingChars.forEach(hec => {
      var idx = rest.indexOf(hec);
      if (idx !== -1 && (hostEnd === -1 || idx < hostEnd)) hostEnd = idx;
    });
    return hostEnd;
  }

  findNonHostChar(rest) {
    var hostEnd = -1;
    nonHostChars.forEach(hec => {
      var idx = rest.indexOf(hec);
      if (idx !== -1 && (hostEnd === -1 || idx < hostEnd)) hostEnd = idx;
    });
    return hostEnd;
  }

  isIPv6() {
    return this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';
  }
}

var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/;
var delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
var unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
var autoEscape = ['\''].concat(unwise);
var nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
var hostEndingChars = ['/', '?', '#'];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var unsafeProtocol = { javascript: true, 'javascript:': true };
var hostlessProtocol = { javascript: true, 'javascript:': true };
var slashedProtocol = {
  http: true, https: true, ftp: true, gopher: true, file: true,
  'http:': true, 'https:': true, 'ftp:': true, 'gopher:': true, 'file:': true
};

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof url === 'object' && url instanceof Url) return url;
  var u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

function urlFormat(obj) {
  if (typeof obj === 'string') obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
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
