'use strict';

class Url {
  constructor(url, baseURL = {}, parser = false) {
    if (!(this instanceof Url)) return new Url(url, baseURL, parser);

    this.defaults = {
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

    this.init(url, parser);
  }

  init(url, parser) {
    const URL_REGEX = /^(https?:)?(\/\/)?([^\/?#:]+)?(:\d+)?(\/[^?#]*)?(\?[^#]*)?(#.*)?/;
    const match = URL_REGEX.exec(url);

    if (match) {
      this.protocol = match[1] || this.defaults.protocol;
      this.slashes = !!match[2] || this.defaults.slashes;
      this.host = match[3] + (match[4] || '');
      this.hostname = match[3] || this.defaults.hostname;
      this.port = (match[4] || '').substring(1) || this.defaults.port;
      this.pathname = match[5] || this.defaults.pathname;
      this.query = match[6] ? this.parseQueryString(match[6].substring(1), parser) : this.defaults.query;
      this.hash = match[7] || this.defaults.hash;
      this.origin = this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
      this.href = this.toString();
    }
  }

  parseQueryString(qs, parser) {
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

  set(key, value) {
    this[key] = value;
    if (key === 'hostname') {
      this.origin = this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
    }
    this.href = this.toString();
  }

  toString() {
    let queryString = this.query && typeof this.query !== 'string' 
      ? '?' + Object.keys(this.query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.query[key])}`).join('&')
      : this.query;

    return `${this.origin}${this.pathname}${queryString}${this.hash}`;
  }
}

module.exports = Url;
