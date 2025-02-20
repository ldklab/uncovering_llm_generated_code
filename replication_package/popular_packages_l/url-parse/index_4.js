'use strict';

class Url {
  constructor(url, baseURL = {}, parser = false) {
    if (!(this instanceof Url)) return new Url(url, baseURL, parser);

    const defaults = {
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

    const URL_REGEX = /^(https?:)?(\/\/)?([^\/?#:]+)?(:\d+)?(\/[^?#]*)?(\?[^#]*)?(#.*)?/;
    const match = URL_REGEX.exec(url);

    if (match) {
      this.protocol = match[1] || defaults.protocol;
      this.slashes = Boolean(match[2]) || defaults.slashes;
      this.host = match[3] + (match[4] || '');
      this.hostname = match[3] || defaults.hostname;
      this.port = match[4] ? match[4].substring(1) : defaults.port;
      this.pathname = match[5] || defaults.pathname;
      this.query = match[6] ? this.parseQueryString(match[6].substring(1), parser) : defaults.query;
      this.hash = match[7] || defaults.hash;
      this.origin = `${this.protocol}//${this.hostname}${this.port ? `:${this.port}` : ''}`;
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
      this.origin = `${this.protocol}//${this.hostname}${this.port ? `:${this.port}` : ''}`;
    }
    this.href = this.toString();
  }

  toString() {
    const queryString = this.query && typeof this.query !== 'string'
      ? `?${Object.keys(this.query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.query[key])}`).join('&')}`
      : this.query;

    return `${this.origin}${this.pathname}${queryString}${this.hash}`;
  }
}

module.exports = Url;
