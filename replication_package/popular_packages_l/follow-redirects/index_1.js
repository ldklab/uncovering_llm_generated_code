const http = require('http');
const https = require('https');
const url = require('url');
const { EventEmitter } = require('events');

const followRedirectsConfig = {
  maxRedirects: 21,
  maxBodyLength: 10 * 1024 * 1024, // 10 MB
};

class RedirectHandler extends EventEmitter {
  constructor(options, callback) {
    super();
    this.options = options;
    this.redirects = 0;
    this.callback = callback;
    this.allowRedirects = options.followRedirects !== false;
    this.maxRedirects = Number.isInteger(options.maxRedirects) ? options.maxRedirects : followRedirectsConfig.maxRedirects;
    this.maxBodyLength = Number.isInteger(options.maxBodyLength) ? options.maxBodyLength : followRedirectsConfig.maxBodyLength;
    this.initializeRequest();
  }

  get protocolModule() {
    return this.options.protocol === 'https:' ? https : http;
  }

  initializeRequest() {
    const req = this.protocolModule.request(this.options, res => this.processResponse(res));
    req.on('error', err => this.emit('error', err));
    req.end();
  }

  processResponse(response) {
    const { statusCode } = response;
    if (this.allowRedirects && [301, 302, 303, 307, 308].includes(statusCode)) {
      if (this.redirects >= this.maxRedirects) {
        this.emit('error', new Error("Exceeded maximum redirects"));
        return;
      }
      this.redirects++;
      const location = response.headers.location;
      if (!location) {
        this.emit('error', new Error("Missing redirect location"));
        return;
      }
      this.options = url.parse(location);
      this.initializeRequest();
    } else {
      if (typeof this.callback === 'function') {
        response.responseUrl = `${this.options.protocol}//${this.options.host}${this.options.path}`;
        this.callback(response);
      }
    }
  }
}

const createWrapper = protocolModules => ({
  http: {
    request: (options, callback) => new RedirectHandler(options, callback),
    get: (urlString, callback) => {
      const options = typeof urlString === 'string' ? { ...url.parse(urlString) } : urlString;
      const req = new RedirectHandler(options, callback);
      req.end();
      return req;
    },
  },
  https: {
    request: (options, callback) => new RedirectHandler(options, callback),
    get: (urlString, callback) => {
      const options = typeof urlString === 'string' ? { ...url.parse(urlString) } : urlString;
      const req = new RedirectHandler(options, callback);
      req.end();
      return req;
    },
  },
});

const defaultWrapper = createWrapper({ http, https });

module.exports = {
  http: defaultWrapper.http,
  https: defaultWrapper.https,
  createWrapper,
  set maxRedirects(value) {
    followRedirectsConfig.maxRedirects = value;
  },
  get maxRedirects() {
    return followRedirectsConfig.maxRedirects;
  },
  set maxBodyLength(value) {
    followRedirectsConfig.maxBodyLength = value;
  },
  get maxBodyLength() {
    return followRedirectsConfig.maxBodyLength;
  },
};
