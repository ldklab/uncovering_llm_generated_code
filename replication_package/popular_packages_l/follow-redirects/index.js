const http = require('http');
const https = require('https');
const url = require('url');
const { EventEmitter } = require('events');

const followRedirects = {
  maxRedirects: 21,
  maxBodyLength: 10 * 1024 * 1024, // 10 MB
};

class RedirectableRequest extends EventEmitter {
  constructor(options, responseCallback) {
    super();
    this.options = options;
    this.redirectCount = 0;
    this.responseCallback = responseCallback;
    this.followRedirects = options.followRedirects !== false;
    this.maxRedirects = typeof options.maxRedirects === 'number' ? options.maxRedirects : followRedirects.maxRedirects;
    this.maxBodyLength = typeof options.maxBodyLength === 'number' ? options.maxBodyLength : followRedirects.maxBodyLength;
    this.performRequest();
  }

  get httpModule() {
    return this.options.protocol === 'https:' ? https : http;
  }

  performRequest() {
    const request = this.httpModule.request(this.options, response => this.handleResponse(response));
    request.on('error', err => this.emit('error', err));
    request.end();
  }

  handleResponse(response) {
    const statusCode = response.statusCode;
    if (this.followRedirects && (statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308)) {
      if (this.redirectCount >= this.maxRedirects) {
        this.emit('error', new Error("Maximum redirects reached"));
        return;
      }
      this.redirectCount++;
      const location = response.headers.location;
      if (!location) {
        this.emit('error', new Error("Redirect location header missing"));
        return;
      }
      this.options = url.parse(location);
      this.performRequest();
    } else {
      if (typeof this.responseCallback === 'function') {
        response.responseUrl = `${this.options.protocol}//${this.options.host}${this.options.path}`;
        this.responseCallback(response);
      }
    }
  }
}

const wrap = modules => {
  return {
    http: {
      request: (options, callback) => new RedirectableRequest(options, callback),
      get: (url, callback) => {
        const options = typeof url === 'string' ? { ...url.parse(url) } : url;
        const request = new RedirectableRequest(options, callback);
        request.end();
        return request;
      },
    },
    https: {
      request: (options, callback) => new RedirectableRequest(options, callback),
      get: (url, callback) => {
        const options = typeof url === 'string' ? { ...url.parse(url) } : url;
        const request = new RedirectableRequest(options, callback);
        request.end();
        return request;
      },
    },
  };
};

const defaultWrapper = wrap({ http, https });

module.exports = {
  http: defaultWrapper.http,
  https: defaultWrapper.https,
  wrap,
  set maxRedirects(value) {
    followRedirects.maxRedirects = value;
  },
  get maxRedirects() {
    return followRedirects.maxRedirects;
  },
  set maxBodyLength(value) {
    followRedirects.maxBodyLength = value;
  },
  get maxBodyLength() {
    return followRedirects.maxBodyLength;
  },
};
