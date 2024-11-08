const CombinedStream = require('combined-stream');
const util = require('util');
const path = require('path');
const http = require('http');
const https = require('https');
const { parse } = require('url');
const fs = require('fs');
const mime = require('mime-types');
const asynckit = require('asynckit');
const populate = require('./populate.js');

module.exports = FormData;

util.inherits(FormData, CombinedStream);

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

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function(field, value, options = {}) {
  if (typeof options === 'string') {
    options = { filename: options };
  }

  const append = CombinedStream.prototype.append.bind(this);

  if (typeof value === 'number') {
    value = value.toString();
  }

  if (util.isArray(value)) {
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  const header = this._multiPartHeader(field, value, options);
  const footer = this._multiPartFooter();

  append(header);
  append(value);
  append(footer);

  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function(header, value, options) {
  let valueLength = options.knownLength ? +options.knownLength : 0;

  if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;

  if (!value || (!value.path && !(value.readable && value.httpVersion))) {
    return;
  }

  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function(value, callback) {
  if (value.fd) {
    if (value.end !== undefined && value.end !== Infinity && value.start !== undefined) {
      callback(null, value.end + 1 - value.start);
    } else {
      fs.stat(value.path, function(err, stat) {
        if (err) {
          callback(err);
        } else {
          callback(null, stat.size - (value.start || 0));
        }
      });
    }
  } else if (value.httpVersion) {
    callback(null, +value.headers['content-length']);
  } else if (value.httpModule) {
    value.on('response', function(response) {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();
  } else {
    callback('Unknown stream');
  }
};

FormData.prototype._multiPartHeader = function(field, value, options) {
  if (typeof options.header === 'string') {
    return options.header;
  }

  const contentDisposition = this._getContentDisposition(value, options);
  const contentType = this._getContentType(value, options);

  const headers = {
    'Content-Disposition': ['form-data', `name="${field}"`, contentDisposition].filter(Boolean),
    'Content-Type': [].concat(contentType || [])
  };

  if (typeof options.header === 'object') {
    populate(headers, options.header);
  }

  const headersString = Object.entries(headers)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('; ') : value}`)
    .join(FormData.LINE_BREAK) + FormData.LINE_BREAK;

  return `--${this.getBoundary()}${FormData.LINE_BREAK}${headersString}${FormData.LINE_BREAK}`;
};

FormData.prototype._getContentDisposition = function(value, options) {
  let filename = options.filepath ? path.normalize(options.filepath).replace(/\\/g, '/') : 
                 options.filename || value.name || value.path ? path.basename(options.filename || value.name || value.path) : 
                 value.readable ? path.basename(value.client._httpMessage.path || '') : 
                 null;

  return filename && `filename="${filename}"`;
};

FormData.prototype._getContentType = function(value, options) {
  return options.contentType || 
         (value.name && mime.lookup(value.name)) || 
         (value.path && mime.lookup(value.path)) || 
         (value.readable && value.httpVersion && value.headers['content-type']) || 
         mime.lookup(options.filepath || options.filename) || 
         (typeof value === 'object' && FormData.DEFAULT_CONTENT_TYPE);
};

FormData.prototype._multiPartFooter = function() {
  return next => {
    let footer = FormData.LINE_BREAK + (this._streams.length === 0 ? this._lastBoundary() : '');
    next(footer);
  };
};

FormData.prototype._lastBoundary = function() {
  return `--${this.getBoundary()}--${FormData.LINE_BREAK}`;
};

FormData.prototype.getHeaders = function(userHeaders = {}) {
  const defaultHeaders = {
    'content-type': `multipart/form-data; boundary=${this.getBoundary()}`
  };

  return Object.keys(userHeaders).reduce((headers, key) => {
    headers[key.toLowerCase()] = userHeaders[key];
    return headers;
  }, defaultHeaders);
};

FormData.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};

FormData.prototype.getBuffer = function() {
  let dataBuffer = Buffer.alloc(0);
  const boundary = this.getBoundary();

  for (const stream of this._streams) {
    if (typeof stream !== 'function') {
      dataBuffer = Buffer.isBuffer(stream) ? 
                   Buffer.concat([dataBuffer, stream]) : 
                   Buffer.concat([dataBuffer, Buffer.from(stream)]);

      if (typeof stream !== 'string' || stream.substring(2, boundary.length + 2) !== boundary) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)]);
      }
    }
  }

  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};

FormData.prototype._generateBoundary = function() {
  this._boundary = `--------------------------${Array.from({ length: 24 }, () => Math.floor(Math.random() * 10).toString(16)).join('')}`;
};

FormData.prototype.getLengthSync = function() {
  const totalLength = this._overheadLength + this._valueLength + (this._streams.length && this._lastBoundary().length || 0);

  if (!this.hasKnownLength()) {
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }

  return totalLength;
};

FormData.prototype.hasKnownLength = function() {
  return !this._valuesToMeasure.length;
};

FormData.prototype.getLength = function(cb) {
  let knownLength = this._overheadLength + this._valueLength + (this._streams.length && this._lastBoundary().length || 0);

  if (!this._valuesToMeasure.length) {
    process.nextTick(() => cb(null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, (err, lengths) => {
    if (err) {
      cb(err);
    } else {
      knownLength += lengths.reduce((total, length) => total + length, 0);
      cb(null, knownLength);
    }
  });
};

FormData.prototype.submit = function(params, cb) {
  const defaults = { method: 'post' };
  const options = typeof params === 'string' ? populate(parse(params), defaults) : populate(params, defaults);

  if (!options.port) {
    options.port = options.protocol === 'https:' ? 443 : 80;
  }

  options.headers = this.getHeaders(params.headers);

  const request = options.protocol === 'https:' ? https.request(options) : http.request(options);

  this.getLength((err, length) => {
    if (err) {
      this._error(err);
      return;
    }
    
    request.setHeader('Content-Length', length);

    this.pipe(request);

    if (cb) {
      const onResponse = res => cb(null, res);
      const onError = err => cb(err);

      request.on('response', onResponse);
      request.on('error', onError);
    }
  });

  return request;
};

FormData.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData.prototype.toString = function() {
  return '[object FormData]';
};
