const http = require('http');
const https = require('https');
const url = require('url');
const { EventEmitter } = require('events');

const redirectConfig = {
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
    this.maxRedirects = options.maxRedirects || redirectConfig.maxRedirects;
    this.maxBodyLength = options.maxBodyLength || redirectConfig.maxBodyLength;
    this.initiateRequest();
  }

  get protocolModule() {
    return this.options.protocol === 'https:' ? https : http;
  }

  initiateRequest() {
    const req = this.protocolModule.request(this.options, res => this.processResponse(res));
    req.on('error', err => this.emit('error', err));
    req.end();
  }

  processResponse(response) {
    const statusCodes = [301, 302, 303, 307, 308];
    if (this.allowRedirects && statusCodes.includes(response.statusCode)) {
      if (this.redirects >= this.maxRedirects) {
        this.emit('error', new Error("Too many redirects"));
        return;
      }
      this.redirects++;
      const newLocation = response.headers.location;
      if (!newLocation) {
        this.emit('error', new Error("No location header for redirect"));
        return;
      }
      this.options = url.parse(newLocation);
      this.initiateRequest();
    } else {
      if (this.callback) {
        response.responseUrl = `${this.options.protocol}//${this.options.host}${this.options.path}`;
        this.callback(response);
      }
    }
  }
}

const createWrappedModules = modules => {
  return {
    http: {
      request: (options, callback) => new RedirectHandler(options, callback),
      get: (url, callback) => {
        const options = typeof url === 'string' ? { ...url.parse(url) } : url;
        const request = new RedirectHandler(options, callback);
        request.end();
        return request;
      },
    },
    https: {
      request: (options, callback) => new RedirectHandler(options, callback),
      get: (url, callback) => {
        const options = typeof url === 'string' ? { ...url.parse(url) } : url;
        const request = new RedirectHandler(options, callback);
        request.end();
        return request;
      },
    },
  };
};

const defaultWrappedModules = createWrappedModules({ http, https });

module.exports = {
  http: defaultWrappedModules.http,
  https: defaultWrappedModules.https,
  wrap: createWrappedModules,
  set maxRedirects(val) {
    redirectConfig.maxRedirects = val;
  },
  get maxRedirects() {
    return redirectConfig.maxRedirects;
  },
  set maxBodyLength(val) {
    redirectConfig.maxBodyLength = val;
  },
  get maxBodyLength() {
    return redirectConfig.maxBodyLength;
  },
};
