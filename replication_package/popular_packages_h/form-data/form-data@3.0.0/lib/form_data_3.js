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

FormData.prototype.append = function (field, value, options = {}) {
  if (typeof options === 'string') {
    options = { filename: options };
  }

  const append = CombinedStream.prototype.append.bind(this);

  if (typeof value === 'number') value = String(value);

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

FormData.prototype._trackLength = function (header, value, options) {
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

  if (!value || (!value.path && !(value.readable && value.hasOwnProperty('httpVersion')))) {
    return;
  }

  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function (value, callback) {
  if (value.hasOwnProperty('fd')) {
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {
      return callback(null, value.end + 1 - (value.start || 0));
    } else {
      return fs.stat(value.path, (err, stat) => {
        if (err) return callback(err);
        const fileSize = stat.size - (value.start || 0);
        return callback(null, fileSize);
      });
    }
  } else if (value.hasOwnProperty('httpVersion')) {
    return callback(null, +value.headers['content-length']);
  } else if (value.hasOwnProperty('httpModule')) {
    value.on('response', function (response) {
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

  let contents = '';
  for (const [prop, header] of Object.entries(headers)) {
    if (header == null || !header.length) continue;
    contents += `${prop}: ${header.join('; ')}${FormData.LINE_BREAK}`;
  }

  return `--${this.getBoundary()}${FormData.LINE_BREAK}${contents}${FormData.LINE_BREAK}`;
};

FormData.prototype._getContentDisposition = function (value, options) {
  let filename;

  if (typeof options.filepath === 'string') {
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
    filename = path.basename(value.client._httpMessage.path || '');
  }

  return filename ? `filename="${filename}"` : null;
};

FormData.prototype._getContentType = function (value, options) {
  let contentType = options.contentType;

  if (!contentType && value.name) {
    contentType = mime.lookup(value.name);
  } else if (!contentType && value.path) {
    contentType = mime.lookup(value.path);
  } else if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
    contentType = value.headers['content-type'];
  } else if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  } else if (!contentType && typeof value === 'object') {
    contentType = FormData.DEFAULT_CONTENT_TYPE;
  }

  return contentType;
};

FormData.prototype._multiPartFooter = function () {
  return (next) => {
    let footer = FormData.LINE_BREAK;

    if (this._streams.length === 0) {
      footer += this._lastBoundary();
    }

    next(footer);
  };
};

FormData.prototype._lastBoundary = function () {
  return `--${this.getBoundary()}--${FormData.LINE_BREAK}`;
};

FormData.prototype.getHeaders = function (userHeaders = {}) {
  const formHeaders = {
    'content-type': `multipart/form-data; boundary=${this.getBoundary()}`
  };

  Object.entries(userHeaders).forEach(([header, value]) => {
    formHeaders[header.toLowerCase()] = value;
  });

  return formHeaders;
};

FormData.prototype.getBoundary = function () {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};

FormData.prototype.getBuffer = function () {
  let dataBuffer = Buffer.alloc(0);
  const boundary = this.getBoundary();

  this._streams.forEach(stream => {
    if (typeof stream !== 'function') {
      const streamBuffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
      dataBuffer = Buffer.concat([dataBuffer, streamBuffer]);

      if (typeof stream !== 'string' || !stream.startsWith(`--${boundary}`)) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)]);
      }
    }
  });

  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};

FormData.prototype._generateBoundary = function () {
  let boundary = '--------------------------';
  for (let i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }
  this._boundary = boundary;
};

FormData.prototype.getLengthSync = function () {
  if (!this.hasKnownLength()) {
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }
  return this._overheadLength + this._valueLength + (this._streams.length ? this._lastBoundary().length : 0);
};

FormData.prototype.hasKnownLength = function () {
  return !this._valuesToMeasure.length;
};

FormData.prototype.getLength = function (cb) {
  let knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, (err, values) => {
    if (err) return cb(err);

    values.forEach(length => {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData.prototype.submit = function (params, cb) {
  const defaults = { method: 'post' };

  let options;
  if (typeof params === 'string') {
    const parsed = parse(params);
    options = populate({
      port: parsed.port,
      path: parsed.pathname,
      host: parsed.hostname,
      protocol: parsed.protocol
    }, defaults);
  } else {
    options = populate(params, defaults);
    if (!options.port) {
      options.port = options.protocol === 'https:' ? 443 : 80;
    }
  }

  options.headers = this.getHeaders(params.headers);

  const request = options.protocol === 'https:' ? https.request(options) : http.request(options);

  this.getLength((err, length) => {
    if (err) return this._error(err);

    request.setHeader('Content-Length', length);

    this.pipe(request);

    if (cb) {
      const callback = (error, response) => {
        request.removeListener('error', callback);
        request.removeListener('response', onResponse);
        cb.call(this, error, response);
      };

      const onResponse = callback.bind(this, null);

      request.on('error', callback);
      request.on('response', onResponse);
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
