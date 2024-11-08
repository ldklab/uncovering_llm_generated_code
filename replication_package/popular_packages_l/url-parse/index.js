'use strict';

function Url(url, baseURL = {}, parser = false) {
  if (!(this instanceof Url)) return new Url(url, baseURL, parser);

  let defaults = {
    protocol: '',
    slashes: null,
    auth: '',
    username: '',
    password: '',
    host: '',
    hostname: '',
    port: '',
    pathname: '',
    query: '',
    hash: '',
    href: '',
    origin: '',
  };

  // Regular Expressions for URL breakdown
  const URL_REGEX = /^(https?:)?(\/\/)?([^\/?#:]+)?(:\d+)?(\/[^?#]*)?(\?[^#]*)?(#.*)?/;

  const match = URL_REGEX.exec(url);
  if (match) {
    this.protocol = match[1] || defaults.protocol;
    this.slashes = !!match[2] || defaults.slashes;
    this.host = match[3] + (match[4] || '');
    this.hostname = match[3] || defaults.hostname;
    this.port = (match[4] || '').substring(1) || defaults.port;
    this.pathname = match[5] || defaults.pathname;
    this.query = match[6] ? parseQueryString(match[6].substring(1), parser) : defaults.query;
    this.hash = match[7] || defaults.hash;
    this.origin = this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
    this.href = this.toString();
  }

  function parseQueryString(qs, parser) {
    if (typeof parser === 'function') return parser(qs);
    if (parser) {
      return qs.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=').map(decodeURIComponent);
        acc[key] = value;
        return acc;
      }, {});
    }
    return qs;
  }
}

Url.prototype.set = function(key, value) {
  this[key] = value;
  if (key === 'hostname') {
    this.origin = this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
  }
  this.href = this.toString();
};

Url.prototype.toString = function() {
  let queryString = this.query && typeof this.query !== 'string' 
    ? '?' + Object.keys(this.query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.query[key])}`).join('&')
    : this.query;

  return `${this.origin}${this.pathname}${queryString}${this.hash}`;
};

module.exports = Url;
```

This code defines a minimal URL parsing module compatible with Node.js and browser environments. The parser breaks down a URL into components using regular expressions and allows manipulation through methods like `set` and output formatting via `toString`.