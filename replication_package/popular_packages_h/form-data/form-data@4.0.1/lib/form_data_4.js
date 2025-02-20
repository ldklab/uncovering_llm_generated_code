const CombinedStream = require('combined-stream');
const util = require('util');
const path = require('path');
const http = require('http');
const https = require('https');
const { parse } = require('url');
const fs = require('fs');
const { Stream } = require('stream');
const mime = require('mime-types');
const asynckit = require('asynckit');
const populate = require('./populate.js');

module.exports = FormData;

util.inherits(FormData, CombinedStream);

function FormData(options = {}) {
  if (!(this instanceof FormData)) return new FormData(options);
  
  CombinedStream.call(this);
  Object.assign(this, options);
  
  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];
}

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function(field, value, options = {}) {
  if (typeof options === 'string') options = { filename: options };

  if (typeof value === 'number') value = String(value);
  if (Array.isArray(value)) return this._error(new Error('Arrays are not supported.'));

  const header = this._multiPartHeader(field, value, options);
  const footer = this._multiPartFooter();

  CombinedStream.prototype.append.call(this, header);
  CombinedStream.prototype.append.call(this, value);
  CombinedStream.prototype.append.call(this, footer);

  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function(header, value, options) {
  let valueLength = 0;
  
  if (options.knownLength != null) {
    valueLength += +options.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;

  if (value && (value.path || (value.readable && value.httpVersion) || value instanceof Stream)) {
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  }
};

FormData.prototype._lengthRetriever = function(value, callback) {
  if (value.fd) {
    if (value.end !== undefined && value.end !== Infinity && value.start !== undefined) {
      callback(null, value.end + 1 - (value.start || 0));
    } else {
      fs.stat(value.path, (err, stat) => {
        if (err) return callback(err);
        callback(null, stat.size - (value.start || 0));
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

  let contents = '';
  const headers = {
    'Content-Disposition': ['form-data', `name="${field}"`, contentDisposition].filter(Boolean),
    'Content-Type': contentType ? [contentType] : []
  };

  if (options.header && typeof options.header === 'object') {
    populate(headers, options.header);
  }

  for (const [key, header] of Object.entries(headers)) {
    if (header) contents += `${key}: ${header.join('; ')}${FormData.LINE_BREAK}`;
  }

  return `--${this.getBoundary()}${FormData.LINE_BREAK}${contents}${FormData.LINE_BREAK}`;
};

FormData.prototype._getContentDisposition = function(value, options) {
  let filename;

  if (typeof options.filepath === 'string') {
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.httpVersion) {
    filename = path.basename(value.client._httpMessage.path || '');
  }

  return filename ? `filename="${filename}"` : undefined;
};

FormData.prototype._getContentType = function(value, options) {
  return (
    options.contentType ||
    mime.lookup(value.name) ||
    mime.lookup(value.path) ||
    (value.readable && value.httpVersion && value.headers['content-type']) ||
    mime.lookup(options.filepath || options.filename) ||
    (typeof value === 'object' ? FormData.DEFAULT_CONTENT_TYPE : undefined)
  );
};

FormData.prototype._multiPartFooter = function() {
  return function(next) {
    let footer = FormData.LINE_BREAK;
    if (this._streams.length === 0) footer += this._lastBoundary();
    next(footer);
  }.bind(this);
};

FormData.prototype._lastBoundary = function() {
  return `--${this.getBoundary()}--${FormData.LINE_BREAK}`;
};

FormData.prototype.getHeaders = function(userHeaders = {}) {
  const formHeaders = {
    'content-type': `multipart/form-data; boundary=${this.getBoundary()}`
  };

  for (const [key, value] of Object.entries(userHeaders)) {
    formHeaders[key.toLowerCase()] = value;
  }

  return formHeaders;
};

FormData.prototype.setBoundary = function(boundary) {
  this._boundary = boundary;
};

FormData.prototype.getBoundary = function() {
  if (!this._boundary) this._generateBoundary();
  return this._boundary;
};

FormData.prototype.getBuffer = function() {
  let dataBuffer = Buffer.alloc(0);
  
  for (const stream of this._streams) {
    if (typeof stream !== 'function') {
      dataBuffer = Buffer.concat([
        dataBuffer,
        Buffer.isBuffer(stream) ? stream : Buffer.from(stream)
      ]);
      
      if (typeof stream !== 'string' || !stream.startsWith('--' + this.getBoundary())) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)]);
      }
    }
  }

  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};

FormData.prototype._generateBoundary = function() {
  this._boundary = '--------------------------' + Array(24).fill().map(() => Math.floor(Math.random() * 10).toString(16)).join('');
};

FormData.prototype.getLengthSync = function() {
  if (!this.hasKnownLength()) this._error(new Error('Cannot calculate proper length in synchronous way.'));
  return this._overheadLength + this._valueLength + (this._streams.length ? this._lastBoundary().length : 0);
};

FormData.prototype.hasKnownLength = function() {
  return this._valuesToMeasure.length === 0;
};

FormData.prototype.getLength = function(cb) {
  let knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) knownLength += this._lastBoundary().length;
  if (!this._valuesToMeasure.length) return process.nextTick(cb.bind(this, null, knownLength));

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, (err, values) => {
    if (err) return cb(err);
    cb(null, values.reduce((length, value) => length + value, knownLength));
  });
};

FormData.prototype.submit = function(params, cb) {
  let options;
  let request;
  const defaults = { method: 'post' };

  if (typeof params === 'string') {
    const url = parse(params);
    options = populate({ port: url.port, path: url.pathname, host: url.hostname, protocol: url.protocol }, defaults);
  } else {
    options = populate(params, defaults);
    if (!options.port) options.port = options.protocol === 'https:' ? 443 : 80;
  }

  options.headers = this.getHeaders(params.headers);
  request = (options.protocol === 'https:' ? https : http).request(options);

  this.getLength((err, length) => {
    if (err && err !== 'Unknown stream') return this._error(err);

    if (length) request.setHeader('Content-Length', length);
    this.pipe(request);

    if (cb) {
      request.on('error', err => cb.call(this, err));
      request.on('response', response => cb.call(this, null, response));
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
