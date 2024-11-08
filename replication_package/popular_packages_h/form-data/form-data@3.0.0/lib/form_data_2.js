const { inherits } = require('util');
const { parse: parseUrl } = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const mime = require('mime-types');
const asynckit = require('asynckit');
const CombinedStream = require('combined-stream');
const populate = require('./populate.js');

function FormData(options = {}) {
  if (!(this instanceof FormData)) {
    return new FormData(options);
  }
  
  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];
  
  CombinedStream.call(this);
  
  Object.assign(this, options);
}

inherits(FormData, CombinedStream);

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function (field, value, options = {}) {
  if (typeof options === 'string') {
    options = { filename: options };
  }
  const appendStream = CombinedStream.prototype.append.bind(this);

  if (typeof value === 'number') {
    value = String(value);
  }

  if (Array.isArray(value)) {
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  const header = this._multiPartHeader(field, value, options);
  const footer = this._multiPartFooter();

  appendStream(header);
  appendStream(value);
  appendStream(footer);

  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function (header, value, options) {
  let valueLength = 0;

  if (options.knownLength != null) {
    valueLength = Number(options.knownLength);
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;

  if (!value || (!value.path && !(value.readable && 'httpVersion' in value))) {
    return;
  }

  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function (value, callback) {
  if ('fd' in value) {
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {
      callback(null, value.end + 1 - (value.start || 0));
    } else {
      fs.stat(value.path, (err, stat) => {
        if (err) {
          callback(err);
          return;
        }
        const fileSize = stat.size - (value.start || 0);
        callback(null, fileSize);
      });
    }
  } else if ('httpVersion' in value) {
    callback(null, +value.headers['content-length']);
  } else if ('httpModule' in value) {
    value.on('response', response => {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();
  } else {
    callback('Unknown stream');
  }
};

FormData.prototype._multiPartHeader = function (field, value, options) {
  if (typeof options.header === 'string') {
    return options.header;
  }

  const contentDisposition = this._getContentDisposition(value, options);
  const contentType = this._getContentType(value, options);

  const headers = {
    'Content-Disposition': ['form-data', `name="${field}"`].concat(contentDisposition || []),
    'Content-Type': [].concat(contentType || [])
  };

  if (typeof options.header === 'object') {
    populate(headers, options.header);
  }

  return `--${this.getBoundary()}\r\n${Object.entries(headers).map(([k, v]) => v && `${k}: ${v.join('; ')}`).filter(Boolean).join('\r\n')}\r\n\r\n`;
};

FormData.prototype._getContentDisposition = function (value, options) {
  let filename;
  
  if (typeof options.filepath === 'string') {
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && 'httpVersion' in value) {
    filename = path.basename(value.client._httpMessage.path || '');
  }

  return filename ? `filename="${filename}"` : null;
};

FormData.prototype._getContentType = function (value, options) {
  return options.contentType || mime.lookup(value.name || value.path || options.filepath || options.filename) || (typeof value === 'object' ? FormData.DEFAULT_CONTENT_TYPE : null);
};

FormData.prototype._multiPartFooter = function () {
  return next => {
    const footer = `\r\n${this._streams.length === 0 ? this._lastBoundary() : ''}`;
    next(footer);
  };
};

FormData.prototype._lastBoundary = function () {
  return `--${this.getBoundary()}--\r\n`;
};

FormData.prototype.getHeaders = function (userHeaders = {}) {
  return {
    'content-type': `multipart/form-data; boundary=${this.getBoundary()}`,
    ...Object.fromEntries(Object.entries(userHeaders).map(([k, v]) => [k.toLowerCase(), v])),
  };
};

FormData.prototype.getBoundary = function () {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};

FormData.prototype.getBuffer = function () {
  let dataBuffer = Buffer.alloc(0);

  for (const stream of this._streams) {
    if (typeof stream !== 'function') {
      const buffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
      dataBuffer = Buffer.concat([dataBuffer, buffer, Buffer.from(FormData.LINE_BREAK)]);
    }
  }

  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};

FormData.prototype._generateBoundary = function () {
  this._boundary = '--------------------------' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 10).toString(16)).join('');
};

FormData.prototype.getLengthSync = function () {
  if (!this.hasKnownLength()) {
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }
  return this._overheadLength + this._valueLength + (this._streams.length ? this._lastBoundary().length : 0);
};

FormData.prototype.hasKnownLength = function () {
  return this._valuesToMeasure.length === 0;
};

FormData.prototype.getLength = function (cb) {
  let knownLength = this._overheadLength + this._valueLength + (this._streams.length ? this._lastBoundary().length : 0);

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever.bind(this), (err, lengths) => {
    if (err) {
      cb(err);
      return;
    }

    lengths.forEach(length => {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData.prototype.submit = function (params, cb) {
  const defaults = { method: 'post' };
  let options;
  
  if (typeof params === 'string') {
    const url = parseUrl(params);
    options = {
      port: url.port,
      path: url.pathname,
      host: url.hostname,
      protocol: url.protocol,
      ...defaults
    };
  } else {
    options = { ...defaults, ...params };
    options.port = options.port || (options.protocol === 'https:' ? 443 : 80);
  }

  options.headers = this.getHeaders(params.headers);

  const request = (options.protocol === 'https:' ? https : http).request(options);

  this.getLength((err, length) => {
    if (err) {
      this._error(err);
      return;
    }

    request.setHeader('Content-Length', length);
    this.pipe(request);

    if (cb) {
      const onResponse = response => cb.call(this, null, response);
      const onError = error => cb.call(this, error);

      request.on('response', onResponse);
      request.on('error', onError);
    }
  });

  return request;
};

FormData.prototype._error = function (err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData.prototype.toString = function () {
  return '[object FormData]';
};

module.exports = FormData;
