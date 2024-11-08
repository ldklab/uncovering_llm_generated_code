const http = require('http');
const https = require('https');
const url = require('url');
const { EventEmitter } = require('events');

const config = {
  maxRedirects: 21,
  maxBodyLength: 10 * 1024 * 1024, // 10 MB
};

class RedirectableRequest extends EventEmitter {
  constructor(options, responseCallback) {
    super();
    this.options = options;
    this.responseCallback = responseCallback;
    this.redirectCount = 0;
    this.followRedirects = options.followRedirects !== false;
    this.maxRedirects = options.maxRedirects ?? config.maxRedirects;
    this.maxBodyLength = options.maxBodyLength ?? config.maxBodyLength;
    this.makeRequest();
  }

  get requestModule() {
    return this.options.protocol === 'https:' ? https : http;
  }

  makeRequest() {
    const req = this.requestModule.request(this.options, res => this.onResponse(res));
    req.on('error', err => this.emit('error', err));
    req.end();
  }

  onResponse(response) {
    const { statusCode, headers } = response;
    if (this.followRedirects && [301, 302, 303, 307, 308].includes(statusCode)) {
      if (this.redirectCount >= this.maxRedirects) {
        return this.emit('error', new Error("Max redirects exceeded"));
      }
      this.redirectCount++;
      const location = headers.location;
      if (!location) {
        return this.emit('error', new Error("Missing location header in redirect"));
      }
      this.options = url.parse(location);
      this.makeRequest();
    } else if (this.responseCallback) {
      response.responseUrl = `${this.options.protocol}//${this.options.host}${this.options.path}`;
      this.responseCallback(response);
    }
  }
}

const wrapModules = mods => ({
  http: {
    request: (opts, cb) => new RedirectableRequest(opts, cb),
    get: (urlStr, cb) => {
      const opts = typeof urlStr === 'string' ? { ...url.parse(urlStr) } : urlStr;
      const req = new RedirectableRequest(opts, cb);
      req.end();
      return req;
    },
  },
  https: {
    request: (opts, cb) => new RedirectableRequest(opts, cb),
    get: (urlStr, cb) => {
      const opts = typeof urlStr === 'string' ? { ...url.parse(urlStr) } : urlStr;
      const req = new RedirectableRequest(opts, cb);
      req.end();
      return req;
    },
  },
});

const wrappedModules = wrapModules({ http, https });

module.exports = {
  http: wrappedModules.http,
  https: wrappedModules.https,
  wrap: wrapModules,
  set maxRedirects(value) {
    config.maxRedirects = value;
  },
  get maxRedirects() {
    return config.maxRedirects;
  },
  set maxBodyLength(value) {
    config.maxBodyLength = value;
  },
  get maxBodyLength() {
    return config.maxBodyLength;
  },
};
