const { request: httpRequest } = require('http');
const { request: httpsRequest } = require('https');
const { parse: parseUrl } = require('url');
const { EventEmitter } = require('events');

const defaultMaxRedirects = 21;
const defaultMaxBodyLength = 10 * 1024 * 1024; // 10 MB

class RedirectableRequest extends EventEmitter {
  constructor(options, responseCallback) {
    super();
    this.options = options;
    this.redirectCount = 0;
    this.responseCallback = responseCallback;
    this.followRedirects = options.followRedirects !== false;
    this.maxRedirects = options.maxRedirects || defaultMaxRedirects;
    this.maxBodyLength = options.maxBodyLength || defaultMaxBodyLength;
    this._initiateRequest();
  }

  get httpModule() {
    return this.options.protocol === 'https:' ? httpsRequest : httpRequest;
  }

  _initiateRequest() {
    const req = this.httpModule(this.options, (res) => this._processResponse(res));
    req.on('error', (err) => this.emit('error', err));
    req.end();
  }

  _processResponse(response) {
    const { statusCode, headers: { location } } = response;
    const isRedirect = [301, 302, 303, 307, 308].includes(statusCode);

    if (this.followRedirects && isRedirect) {
      if (this.redirectCount >= this.maxRedirects) {
        this.emit('error', new Error('Maximum redirects reached.'));
        return;
      }
      if (!location) {
        this.emit('error', new Error('Redirect location missing.'));
        return;
      }

      this.redirectCount++;
      this.options = parseUrl(location);
      this._initiateRequest();
    } else if (typeof this.responseCallback === 'function') {
      response.responseUrl = `${this.options.protocol}//${this.options.host}${this.options.path}`;
      this.responseCallback(response);
    }
  }
}

const createWrappedModule = ({ http, https }) => ({
  http: {
    request: (options, callback) => new RedirectableRequest(options, callback),
    get: (url, callback) => {
      const options = typeof url === 'string' ? parseUrl(url) : url;
      const req = new RedirectableRequest(options, callback);
      req.end();
      return req;
    },
  },
  https: {
    request: (options, callback) => new RedirectableRequest(options, callback),
    get: (url, callback) => {
      const options = typeof url === 'string' ? parseUrl(url) : url;
      const req = new RedirectableRequest(options, callback);
      req.end();
      return req;
    },
  },
});

const wrappedModules = createWrappedModule({ http: { request: httpRequest }, https: { request: httpsRequest } });

module.exports = Object.assign({}, wrappedModules, {
  wrap: createWrappedModule,
  get maxRedirects() {
    return defaultMaxRedirects;
  },
  set maxRedirects(value) {
    followRedirects.maxRedirects = value;
  },
  get maxBodyLength() {
    return defaultMaxBodyLength;
  },
  set maxBodyLength(value) {
    followRedirects.maxBodyLength = value;
  },
});
