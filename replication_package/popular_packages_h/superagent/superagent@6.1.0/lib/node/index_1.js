"use strict";

// Import necessary modules
const { parse, format, resolve } = require('url');
const Stream = require('stream');
const https = require('https');
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const qs = require('qs');
const mime = require('mime');
let methods = require('methods');
const FormData = require('form-data');
const formidable = require('formidable');
const debug = require('debug')('superagent');
const CookieJar = require('cookiejar');
const semver = require('semver');
const safeStringify = require('fast-safe-stringify');

const utils = require('../utils');
const RequestBase = require('../request-base');
const { unzip } = require('./unzip');
const Response = require('./response');

let http2;

if (semver.gte(process.version, 'v10.10.0')) http2 = require('./http2wrapper');

function request(method, url) {
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  }

  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

module.exports = request;
exports = module.exports;

exports.Request = Request;
exports.agent = require('./agent');

function noop() {}

exports.Response = Response;

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
}, true);

exports.protocols = {
  'http:': http,
  'https:': https,
  'http2:': http2
};

exports.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};

exports.parse = require('./parsers');

exports.buffer = {};

function _initHeaders(req) {
  req._header = {};
  req.header = {};
}

function Request(method, url) {
  Stream.call(this);
  if (typeof url !== 'string') url = format(url);
  this._enableHttp2 = Boolean(process.env.HTTP2_TEST);
  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;
  _initHeaders(this);
  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this._query = [];
  this.qsRaw = this._query;
  this._redirectList = [];
  this._streamRequest = false;
  this.once('end', this.clearTimeout.bind(this));
}

util.inherits(Request, Stream);
RequestBase(Request.prototype);

Request.prototype.http2 = function (bool) {
  if (exports.protocols['http2:'] === undefined) {
    throw new Error('superagent: this version of Node.js does not support http2');
  }
  this._enableHttp2 = bool === undefined ? true : bool;
  return this;
};

Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    let o = options || {};
    if (typeof options === 'string') {
      o = { filename: options };
    }

    if (typeof file === 'string') {
      if (!o.filename) o.filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
    } else if (!o.filename && file.path) {
      o.filename = file.path;
    }

    this._getFormData().append(field, file, o);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new FormData();
    this._formData.on('error', (err) => {
      debug('FormData error', err);
      if (this.called) return;
      this.callback(err);
      this.abort();
    });
  }
  return this._formData;
};

Request.prototype.agent = function (agent) {
  if (arguments.length === 0) return this._agent;
  this._agent = agent;
  return this;
};

Request.prototype.type = function (type) {
  return this.set('Content-Type', type.includes('/') ? type : mime.getType(type));
};

Request.prototype.accept = function (type) {
  return this.set('Accept', type.includes('/') ? type : mime.getType(type));
};

Request.prototype.query = function (val) {
  if (typeof val === 'string') {
    this._query.push(val);
  } else {
    Object.assign(this.qs, val);
  }
  return this;
};

Request.prototype.write = function (data, encoding) {
  const req = this.request();
  if (!this._streamRequest) {
    this._streamRequest = true;
  }
  return req.write(data, encoding);
};

Request.prototype.pipe = function (stream, options) {
  this.piped = true;
  this.buffer(false);
  this.end();
  return this._pipeContinue(stream, options);
};

Request.prototype._pipeContinue = function (stream, options) {
  this.req.once('response', (res) => {
    if (isRedirect(res.statusCode) && this._redirects++ !== this._maxRedirects) {
      return this._redirect(res) === this ? this._pipeContinue(stream, options) : undefined;
    }
    this.res = res;
    this._emitResponse();
    if (this._aborted) return;
    if (this._shouldUnzip(res)) {
      const unzipObj = zlib.createUnzip();
      unzipObj.on('error', (err) => {
        if (err && err.code === 'Z_BUF_ERROR') {
          stream.emit('end');
          return;
        }
        stream.emit('error', err);
      });
      res.pipe(unzipObj).pipe(stream, options);
    } else {
      res.pipe(stream, options);
    }
    res.once('end', () => {
      this.emit('end');
    });
  });
  return stream;
};

Request.prototype.buffer = function (val) {
  this._buffer = val !== false;
  return this;
};

Request.prototype._redirect = function (res) {
  let url = res.headers.location;
  if (!url) {
    return this.callback(new Error('No location header for redirect'), res);
  }
  debug('redirect %s -> %s', this.url, url);
  url = resolve(this.url, url);
  res.resume();
  let headers = this.req.getHeaders ? this.req.getHeaders() : this.req._headers;
  const changesOrigin = parse(url).host !== parse(this.url).host;
  if (res.statusCode === 301 || res.statusCode === 302) {
    headers = utils.cleanHeader(headers, changesOrigin);
    this.method = this.method === 'HEAD' ? 'HEAD' : 'GET';
    this._data = null;
  }
  if (res.statusCode === 303) {
    headers = utils.cleanHeader(headers, changesOrigin);
    this.method = 'GET';
    this._data = null;
  }
  delete headers.host;
  delete this.req;
  delete this._formData;
  _initHeaders(this);
  this._endCalled = false;
  this.url = url;
  this.qs = {};
  this._query.length = 0;
  this.set(headers);
  this.emit('redirect', res);
  this._redirectList.push(this.url);
  this.end(this._callback);
  return this;
};

Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';
  if (typeof pass === 'object' && pass !== null) {
    options = pass;
    pass = '';
  }
  if (!options) {
    options = { type: 'basic' };
  }
  const encoder = (string) => Buffer.from(string).toString('base64');
  return this._auth(user, pass, options, encoder);
};

Request.prototype.ca = function (cert) {
  this._ca = cert;
  return this;
};

Request.prototype.key = function (cert) {
  this._key = cert;
  return this;
};

Request.prototype.pfx = function (cert) {
  if (typeof cert === 'object' && !Buffer.isBuffer(cert)) {
    this._pfx = cert.pfx;
    this._passphrase = cert.passphrase;
  } else {
    this._pfx = cert;
  }
  return this;
};

Request.prototype.cert = function (cert) {
  this._cert = cert;
  return this;
};

Request.prototype.disableTLSCerts = function () {
  this._disableTLSCerts = true;
  return this;
};

Request.prototype.request = function () {
  if (this.req) return this.req;
  const options = {};
  try {
    const query = qs.stringify(this.qs, {
      indices: false,
      strictNullHandling: true
    });
    if (query) {
      this.qs = {};
      this._query.push(query);
    }
    this._finalizeQueryString();
  } catch (err) {
    return this.emit('error', err);
  }

  let url = this.url;
  const retries = this._retries;
  let queryStringBackticks;
  if (url.includes('`')) {
    const queryStartIndex = url.indexOf('?');
    if (queryStartIndex !== -1) {
      const queryString = url.slice(queryStartIndex + 1);
      queryStringBackticks = queryString.match(/`|%60/g);
    }
  }

  if (url.indexOf('http') !== 0) url = `http://${url}`;
  url = parse(url);

  if (queryStringBackticks) {
    let i = 0;
    url.query = url.query.replace(/%60/g, () => queryStringBackticks[i++]);
    url.search = `?${url.query}`;
    url.path = url.pathname + url.search;
  }

  if (/^https?\+unix:/.test(url.protocol) === true) {
    url.protocol = `${url.protocol.split('+')[0]}:`;
    const unixParts = url.path.match(/^([^/]+)(.+)$/);
    options.socketPath = unixParts[1].replace(/%2F/g, '/');
    url.path = unixParts[2];
  }

  if (this._connectOverride) {
    const { hostname } = url;
    const match = hostname in this._connectOverride ? this._connectOverride[hostname] : this._connectOverride['*'];
    if (match) {
      if (!this._header.host) {
        this.set('host', url.host);
      }
      let newHost;
      let newPort;
      if (typeof match === 'object') {
        newHost = match.host;
        newPort = match.port;
      } else {
        newHost = match;
        newPort = url.port;
      }
      url.host = /:/.test(newHost) ? `[${newHost}]` : newHost;
      if (newPort) {
        url.host += `:${newPort}`;
        url.port = newPort;
      }
      url.hostname = newHost;
    }
  }

  options.method = this.method;
  options.port = url.port;
  options.path = url.path;
  options.host = url.hostname;
  options.ca = this._ca;
  options.key = this._key;
  options.pfx = this._pfx;
  options.cert = this._cert;
  options.passphrase = this._passphrase;
  options.agent = this._agent;
  options.rejectUnauthorized = typeof this._disableTLSCerts === 'boolean' ? !this._disableTLSCerts : process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';

  if (this._header.host) {
    options.servername = this._header.host.replace(/:\d+$/, '');
  }

  if (this._trustLocalhost && /^(?:localhost|127\.0\.0\.\d+|(0*:)+:0*1)$/.test(url.hostname)) {
    options.rejectUnauthorized = false;
  }

  const mod = this._enableHttp2 ? exports.protocols['http2:'].setProtocol(url.protocol) : exports.protocols[url.protocol];

  this.req = mod.request(options);
  const { req } = this;

  req.setNoDelay(true);
  if (options.method !== 'HEAD') {
    req.setHeader('Accept-Encoding', 'gzip, deflate');
  }
  this.protocol = url.protocol;
  this.host = url.host;

  req.once('drain', () => {
    this.emit('drain');
  });

  req.on('error', (err) => {
    if (this._aborted) return;
    if (this._retries !== retries) return;
    if (this.response) return;
    this.callback(err);
  });

  if (url.auth) {
    const auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  if (this.username && this.password) {
    this.auth(this.username, this.password);
  }

  for (const key in this.header) {
    if (Object.prototype.hasOwnProperty.call(this.header, key)) req.setHeader(key, this.header[key]);
  }

  if (this.cookies) {
    if (Object.prototype.hasOwnProperty.call(this._header, 'cookie')) {
      const tmpJar = new CookieJar.CookieJar();
      tmpJar.setCookies(this._header.cookie.split(';'));
      tmpJar.setCookies(this.cookies.split(';'));
      req.setHeader('Cookie', tmpJar.getCookies(CookieJar.CookieAccessInfo.All).toValueString());
    } else {
      req.setHeader('Cookie', this.cookies);
    }
  }
  return req;
};

Request.prototype.callback = function (err, res) {
  if (this._shouldRetry(err, res)) {
    return this._retry();
  }
  const fn = this._callback || noop;
  this.clearTimeout();
  if (this.called) return console.warn('superagent: double callback bug');
  this.called = true;
  if (!err) {
    try {
      if (!this._isResponseOK(res)) {
        let msg = 'Unsuccessful HTTP response';
        if (res) {
          msg = http.STATUS_CODES[res.status] || msg;
        }
        err = new Error(msg);
        err.status = res ? res.status : undefined;
      }
    } catch (err_) {
      err = err_;
    }
  }
  if (!err) {
    return fn(null, res);
  }
  err.response = res;
  if (this._maxRetries) err.retries = this._retries - 1;
  if (err && this.listeners('error').length > 0) {
    this.emit('error', err);
  }
  fn(err, res);
};

Request.prototype._isHost = function (obj) {
  return Buffer.isBuffer(obj) || obj instanceof Stream || obj instanceof FormData;
};

Request.prototype._emitResponse = function (body, files) {
  const response = new Response(this);
  this.response = response;
  response.redirects = this._redirectList;
  if (undefined !== body) {
    response.body = body;
  }
  response.files = files;
  if (this._endCalled) {
    response.pipe = function () {
      throw new Error("end() has already been called, so it's too late to start piping");
    };
  }
  this.emit('response', response);
  return response;
};

Request.prototype.end = function (fn) {
  this.request();
  debug('%s %s', this.method, this.url);
  if (this._endCalled) {
    throw new Error('.end() was called twice. This is not supported in superagent');
  }
  this._endCalled = true;
  this._callback = fn || noop;
  this._end();
};

Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  let data = this._data;
  const { req } = this;
  const { method } = this;
  this._setTimeouts();
  if (method !== 'HEAD' && !req._headerSent) {
    if (typeof data !== 'string') {
      let contentType = req.getHeader('Content-Type');
      if (contentType) contentType = contentType.split(';')[0];
      const serialize = this._serializer || exports.serialize[contentType];
      if (!serialize && isJSON(contentType)) {
        serialize = exports.serialize['application/json'];
      }
      if (serialize) data = serialize(data);
    }
    if (data && !req.getHeader('Content-Length')) {
      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
    }
  }
  req.once('response', (res) => {
    debug('%s %s -> %s', this.method, this.url, res.statusCode);
    if (this._responseTimeoutTimer) {
      clearTimeout(this._responseTimeoutTimer);
    }
    if (this.piped) {
      return;
    }
    const max = this._maxRedirects;
    const mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
    let type = mime.split('/')[0];
    if (type) type = type.toLowerCase().trim();
    const multipart = type === 'multipart';
    const redirect = isRedirect(res.statusCode);
    const responseType = this._responseType;
    this.res = res;
    if (redirect && this._redirects++ !== max) {
      return this._redirect(res);
    }
    if (this.method === 'HEAD') {
      this.emit('end');
      this.callback(null, this._emitResponse());
      return;
    }
    if (this._shouldUnzip(res)) {
      unzip(req, res);
    }
    let buffer = this._buffer;
    if (buffer === undefined && mime in exports.buffer) {
      buffer = Boolean(exports.buffer[mime]);
    }
    let parser = this._parser;
    if (undefined === buffer) {
      if (parser) {
        console.warn("A custom superagent parser has been set, but buffering strategy for the parser hasn't been configured. Call `req.buffer(true or false)` or set `superagent.buffer[mime] = true or false`");
        buffer = true;
      }
    }
    if (!parser) {
      if (responseType) {
        parser = exports.parse.image;
        buffer = true;
      } else if (multipart) {
        const form = new formidable.IncomingForm();
        parser = form.parse.bind(form);
        buffer = true;
      } else if (isImageOrVideo(mime)) {
        parser = exports.parse.image;
        buffer = true;
      } else if (exports.parse[mime]) {
        parser = exports.parse[mime];
      } else if (type === 'text') {
        parser = exports.parse.text;
        buffer = buffer !== false;
      } else if (isJSON(mime)) {
        parser = exports.parse['application/json'];
        buffer = buffer !== false;
      } else if (buffer) {
        parser = exports.parse.text;
      } else if (undefined === buffer) {
        parser = exports.parse.image;
        buffer = true;
      }
    }
    if (undefined === buffer && isText(mime) || isJSON(mime)) {
      buffer = true;
    }
    this._resBuffered = buffer;
    let parserHandlesEnd = false;
    if (buffer) {
      const responseBytesLeft = this._maxResponseSize || 200000000;
      res.on('data', (buf) => {
        responseBytesLeft -= buf.byteLength || buf.length;
        if (responseBytesLeft < 0) {
          const err = new Error('Maximum response size reached');
          err.code = 'ETOOLARGE';
          parserHandlesEnd = false;
          res.destroy(err);
        }
      });
    }
    if (parser) {
      try {
        parserHandlesEnd = buffer;
        parser(res, (err, obj, files) => {
          if (this.timedout) {
            return;
          }
          if (err && !this._aborted) {
            return this.callback(err);
          }
          if (parserHandlesEnd) {
            this.emit('end');
            this.callback(null, this._emitResponse(obj, files));
          }
        });
      } catch (err) {
        this.callback(err);
        return;
      }
    }
    this.res = res;
    if (!buffer) {
      debug('unbuffered %s %s', this.method, this.url);
      this.callback(null, this._emitResponse());
      if (multipart) return;
      res.once('end', () => {
        debug('end %s %s', this.method, this.url);
        this.emit('end');
      });
      return;
    }
    res.once('error', (err) => {
      parserHandlesEnd = false;
      this.callback(err, null);
    });
    if (!parserHandlesEnd) res.once('end', () => {
      debug('end %s %s', this.method, this.url);
      this.emit('end');
      this.callback(null, this._emitResponse());
    });
  });
  this.emit('request', this);
  const getProgressMonitor = () => {
    const lengthComputable = true;
    const total = req.getHeader('Content-Length');
    let loaded = 0;
    const progress = new Stream.Transform();
    progress._transform = function (chunk, encoding, cb) {
      loaded += chunk.length;
      this.emit('progress', {
        direction: 'upload',
        lengthComputable: lengthComputable,
        loaded: loaded,
        total: total
      });
      cb(null, chunk);
    };
    return progress;
  };
  const bufferToChunks = (buffer) => {
    const chunkSize = 16 * 1024;
    const chunking = new Stream.Readable();
    const totalLength = buffer.length;
    const remainder = totalLength % chunkSize;
    const cutoff = totalLength - remainder;
    for (let i = 0; i < cutoff; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      chunking.push(chunk);
    }
    if (remainder > 0) {
      const remainderBuffer = buffer.slice(-remainder);
      chunking.push(remainderBuffer);
    }
    chunking.push(null);
    return chunking;
  };
  const formData = this._formData;
  if (formData) {
    const headers = formData.getHeaders();
    for (const i in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, i)) {
        debug('setting FormData header: "%s: %s"', i, headers[i]);
        req.setHeader(i, headers[i]);
      }
    }
    formData.getLength((err, length) => {
      if (err) debug('formData.getLength had error', err, length);
      debug('got FormData Content-Length: %s', length);
      if (typeof length === 'number') {
        req.setHeader('Content-Length', length);
      }
      formData.pipe(getProgressMonitor()).pipe(req);
    });
  } else if (Buffer.isBuffer(data)) {
    bufferToChunks(data).pipe(getProgressMonitor()).pipe(req);
  } else {
    req.end(data);
  }
};

Request.prototype._shouldUnzip = function (res) {
  if (res.statusCode === 204 || res.statusCode === 304) {
    return false;
  }
  if (res.headers['content-length'] === '0') {
    return false;
  }
  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
};

Request.prototype.connect = function (connectOverride) {
  if (typeof connectOverride === 'string') {
    this._connectOverride = { '*': connectOverride };
  } else if (typeof connectOverride === 'object') {
    this._connectOverride = connectOverride;
  } else {
    this._connectOverride = undefined;
  }
  return this;
};

Request.prototype.trustLocalhost = function (toggle) {
  this._trustLocalhost = toggle === undefined ? true : toggle;
  return this;
};

if (!methods.includes('del')) {
  methods = methods.slice(0);
  methods.push('del');
}

methods.forEach((method) => {
  const name = method;
  method = method === 'del' ? 'delete' : method;
  method = method.toUpperCase();

  request[name] = function (url, data, fn) {
    const req = request(method, url);
    if (typeof data === 'function') {
      fn = data;
      data = null;
    }
    if (data) {
      if (method === 'GET' || method === 'HEAD') {
        req.query(data);
      } else {
        req.send(data);
      }
    }
    if (fn) req.end(fn);
    return req;
  };
});

function isText(mime) {
  const parts = mime.split('/');
  let type = parts[0];
  if (type) type = type.toLowerCase().trim();
  let subtype = parts[1];
  if (subtype) subtype = subtype.toLowerCase().trim();
  return type === 'text' || subtype === 'x-www-form-urlencoded';
}

function isImageOrVideo(mime) {
  let type = mime.split('/')[0];
  if (type) type = type.toLowerCase().trim();
  return type === 'image' || type === 'video';
}

function isJSON(mime) {
  return /[/+]json($|[^-\w])/i.test(mime);
}

function isRedirect(code) {
  return [301, 302, 303, 305, 307, 308].includes(code);
}
