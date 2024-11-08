// Import the necessary modules
import punycode from 'punycode';
import * as util from './util';
import querystring from 'querystring';

// Export functions as named exports
export { urlParse, urlResolve, urlResolveObject, urlFormat };

export class Url {
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
    if (!util.isString(url)) throw new TypeError(`Parameter 'url' must be a string, not ${typeof url}`);

    let queryIndex = url.indexOf('?');
    let splitter = (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#';
    let uSplit = url.split(splitter).map(part => part.replace(/\\/g, '/'));
    url = uSplit.join(splitter).trim();

    if (!slashesDenoteHost && url.split('#').length === 1) {
      let simplePath = simplePathPattern.exec(url);
      if (simplePath) {
        this.path = this.href = url;
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

    let proto = protocolPattern.exec(url);
    if (proto) {
      proto = proto[0];
      this.protocol = proto.toLowerCase();
      url = url.substr(proto.length);
    }

    if (slashesDenoteHost || proto || /^\/\/[^@\/]+@[^@\/]+/.test(url)) {
      let slashes = url.startsWith('//');
      if (slashes && !(proto && hostlessProtocol[proto])) {
        url = url.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] &&
      (url.match(hostEndingChars) || slashedProtocol[proto] || url.includes('@'))) {
      
      let hostEnd = hostEndingChars.reduce((end, char) => {
        let index = url.indexOf(char);
        return index !== -1 && (end === -1 || index < end) ? index : end;
      }, -1);
    
      let atSign = hostEnd === -1 ? url.lastIndexOf('@') : url.lastIndexOf('@', hostEnd);
    
      if (atSign !== -1) {
        this.auth = decodeURIComponent(url.slice(0, atSign));
        url = url.slice(atSign + 1);
      }
    
      hostEnd = nonHostChars.reduce((end, char) => {
        let index = url.indexOf(char);
        return index !== -1 && (end === -1 || index < end) ? index : end;
      }, -1);
    
      if (hostEnd === -1) hostEnd = url.length;
    
      this.host = url.slice(0, hostEnd);
      url = url.slice(hostEnd);
      this.parseHost();
    
      this.hostname = this.hostname || '';
      if (this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']') {
        this.hostname = this.hostname.slice(1, -1);
      } else {
        let parts = this.hostname.split('.');
        for (let i = 0; i < parts.length; i++) {
          let part = parts[i];
          if (!hostnamePartPattern.test(part)) {
            const newpart = part.replace(/./g, char => char.charCodeAt(0) > 127 ? 'x' : char);
            if (!hostnamePartPattern.test(newpart)) {
              let validParts = parts.slice(0, i);
              let notHost = parts.slice(i + 1);
              let match = part.match(hostnamePartStart);
              if (match) {
                validParts.push(match[1]);
                notHost.unshift(match[2]);
              }
              if (notHost.length) url = '/' + notHost.join('.') + url;
              this.hostname = validParts.join('.');
              break;
            }
          }
        }
      }
    
      if (this.hostname.length > hostnameMaxLen) this.hostname = '';
      this.hostname = punycode.toASCII(this.hostname.toLowerCase());
      let p = this.port ? `:${this.port}` : '';
      this.host = `${this.hostname}${p}`;
      this.href += this.host;
    }

    // Additionally perform encoding and set remaining url properties
    if (!unsafeProtocol[this.protocol]) {
      for (const ae of autoEscape) {
        if (url.indexOf(ae) === -1) continue;
        let esc = encodeURIComponent(ae);
        if (esc === ae) esc = escape(ae);
        url = url.split(ae).join(esc);
      }
    }

    const hash = url.indexOf('#');
    if (hash !== -1) {
      this.hash = url.slice(hash);
      url = url.slice(0, hash);
    }

    const qm = url.indexOf('?');
    if (qm !== -1) {
      this.search = url.slice(qm);
      this.query = url.slice(qm + 1);
      if (parseQueryString) this.query = querystring.parse(this.query);
      url = url.slice(0, qm);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }

    if (url) this.pathname = url;
    if (slashedProtocol[this.protocol] && this.hostname && !this.pathname) this.pathname = '/';
    if (this.pathname || this.search) this.path = (this.pathname || '') + (this.search || '');
    this.href = this.format();
    return this;
  }
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
const slashedProtocol = { 'http': true, 'https': true, 'ftp': true, 'gopher': true, 'file': true, 'http:': true, 'https:': true, 'ftp:': true, 'gopher:': true, 'file:': true };

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

function urlFormat(obj) {
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.format = function() {
  let auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth).replace(/%3A/i, ':') + '@';
  }

  const protocol = this.protocol || '';
  let pathname = this.pathname || '';
  const hash = this.hash || '';
  let host = false;
  let query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : `[${this.hostname}]`);
    if (this.port) host += `:${this.port}`;
  }

  if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  const search = this.search || (query && `?${query}`) || '';
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
  Object.keys(this).forEach(key => {
    result[key] = this[key];
  });

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
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(key => {
        result[key] = relative[key];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      let relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift())) { }
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
    if (result.pathname || result.search) result.path = (result.pathname || '') + (result.search || '');
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
      if (!srcPath[0]) srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (!relPath[0]) relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (!relPath[0] || !srcPath[0]);
  }

  if (isRelAbs) {
    result.host = relative.host || '';
    result.hostname = relative.hostname || '';
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
      const authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
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
    if (result.search) result.path = '/' + result.search;
    else result.path = null;
    result.href = result.format();
    return result;
  }

  let last = srcPath.slice(-1)[0];
  const hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '' || last === '..');
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
    const authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  result.pathname = srcPath.length ? srcPath.join('/') : null;
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
  const port = portPattern.exec(host);
  if (port) {
    this.port = port[0] !== ':' ? port[0].substr(1) : null;
    host = host.substr(0, host.length - port[0].length);
  }
  if (host) this.hostname = host;
};
