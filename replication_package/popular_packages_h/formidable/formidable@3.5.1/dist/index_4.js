'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const EventEmitter = require('node:events');
const os = require('node:os');
const path = require('node:path');
const fsPromises = require('node:fs/promises');
const { StringDecoder } = require('node:string_decoder');
const { PassThrough, Transform, Stream } = require('node:stream');
const hexoid = require('hexoid');
const once = require('once');
const dezalgo = require('dezalgo');

class FileBase extends EventEmitter {
  constructor({ filepath, newFilename, originalFilename, mimetype, hashAlgorithm }) {
    super();
    this.filepath = filepath;
    this.newFilename = newFilename;
    this.originalFilename = originalFilename;
    this.mimetype = mimetype;
    this.hashAlgorithm = hashAlgorithm;
    this.lastModifiedDate = null;
    this.size = 0;
    this.hash = typeof hashAlgorithm === 'string' ? crypto.createHash(hashAlgorithm) : null;
    this._writeStream = null;
  }

  write(buffer, cb) {
    if (this.hash) this.hash.update(buffer);
    if (this._writeStream.closed) {
      cb();
      return;
    }
    this._writeStream.write(buffer, () => {
      this.lastModifiedDate = new Date();
      this.size += buffer.length;
      this.emit('progress', this.size);
      cb();
    });
  }

  end(cb) {
    if (this.hash) {
      this.hash = this.hash.digest('hex');
    }
    this._writeStream.end(() => {
      this.emit('end');
      cb();
    });
  }
}

class PersistentFile extends FileBase {
  constructor(params) {
    super(params);
  }

  open() {
    this._writeStream = fs.createWriteStream(this.filepath);
    this._writeStream.on('error', (err) => this.emit('error', err));
  }

  destroy() {
    this._writeStream.destroy();
    setTimeout(() => fs.unlink(this.filepath, () => {}), 1);
  }
}

class VolatileFile extends FileBase {
  constructor(params) {
    super(params);
    this.createFileWriteStream = params.createFileWriteStream;
  }

  open() {
    this._writeStream = this.createFileWriteStream(this);
    this._writeStream.on('error', (err) => this.emit('error', err));
  }

  destroy() {
    this._writeStream.destroy();
  }
}

class OctetStreamParser extends PassThrough {
  constructor(options = {}) {
    super();
    this.globalOptions = { ...options };
  }
}

const PLUGIN_IMPLEMENTATIONS = {
  octetstream: async function octetStreamPlugin(formidable, options) {
    const self = this || formidable;
    if (/octet-stream/i.test(self.headers['content-type'])) {
      await self.initWithOctetStream(options);
    }
  },
  querystring: function querystringPlugin(formidable, options) {
    const self = this || formidable;
    if (/urlencoded/i.test(self.headers['content-type'])) {
      self.initWithQuerystring(options);
    }
  },
  multipart: function multipartPlugin(formidable, options) {
    const self = this || formidable;
    if (/multipart/i.test(self.headers['content-type'])) {
      const m = self.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (m) {
        self.initWithMultipart(m[1] || m[2], options);
      } else {
        self._error(new FormidableError('bad content-type header, no multipart boundary', 1013, 400));
      }
    }
  },
  json: function jsonPlugin(formidable, options) {
    const self = this || formidable;
    if (/json/i.test(self.headers['content-type'])) {
      self.initWithJSON(options);
    }
  }
};

class IncomingForm extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxFields: 1000,
      maxFieldsSize: 20 * 1024 * 1024,
      maxFiles: Infinity,
      maxFileSize: 200 * 1024 * 1024,
      maxTotalFileSize: undefined,
      minFileSize: 1,
      allowEmptyFiles: false,
      createDirsFromUploads: false,
      keepExtensions: false,
      encoding: 'utf-8',
      hashAlgorithm: false,
      uploadDir: os.tmpdir(),
      enabledPlugins: [PLUGIN_IMPLEMENTATIONS.octetstream, PLUGIN_IMPLEMENTATIONS.querystring, PLUGIN_IMPLEMENTATIONS.multipart, PLUGIN_IMPLEMENTATIONS.json],
      fileWriteStreamHandler: null,
      defaultInvalidName: 'invalid-name',
      filter: () => true,
      filename: undefined,
    };
    Object.assign(this.options, options);

    this.uploaddir = path.resolve(this.options.uploadDir);
    this.uploadDir = this.uploaddir;
    this.error = this.headers = this.type = this.bytesExpected = this.bytesReceived = this._parser = this.req = null;
    this._setUpRename();
    this._flushing = this._fieldsSize = this._totalFileSize = 0;
    this._plugins = this.options.enabledPlugins.filter(Boolean).map(plugin => plugin.call(this, this, this.options));
    this.openedFiles = [];
    this._setUpMaxFields();
    this._setUpMaxFiles();

    if (!this.options.maxTotalFileSize) {
      this.options.maxTotalFileSize = this.options.maxFileSize;
    }
  }

  async parse(req, cb) {
    this.req = req;
    const callback = once(dezalgo(cb || ((err, fields, files) => (err ? Promise.reject(err) : Promise.resolve([fields, files])))));
    this.fields = {};
    const files = {};
    
    this
      .on('field', (name, value) => this.fields[name] = this.fields[name] ? [...this.fields[name], value] : value)
      .on('file', (name, file) => files[name] = files[name] ? [...files[name], file] : file)
      .on('error', err => callback(err, this.fields, files))
      .on('end', () => callback(null, this.fields, files));
    
    await this.writeHeaders(req.headers);
    req
      .on('error', err => this._error(err))
      .on('aborted', () => this._error(new FormidableError('Request aborted', 1002)))
      .on('data', buffer => this.write(buffer))
      .on('end', () => this._parser && this._parser.end());
    return cb ? undefined : callback.promise;
  }

  _error(err) {
    if (this.error || this.ended) return;
    this.req = this.error = err;
    this.emit('error', err);
    this.openedFiles.forEach(file => file.destroy());
  }

  // Other class methods remain similar
  
  // parser initialization methods
  async initWithOctetStream(options) { /* implementation */ }
  initWithQuerystring() { /* implementation */ }
  initWithMultipart(boundary, options) { /* implementation */ }
  initWithJSON() { /* implementation */ }
}

// Main exports
exports.formidable = (...args) => new IncomingForm(...args);
exports.PersistentFile = PersistentFile;
exports.VolatileFile = VolatileFile;
exports.OctetStreamParser = OctetStreamParser;
exports.FormidableError = class FormidableError extends Error {
  constructor(message, internalCode, httpCode = 500) {
    super(message);
    this.code = internalCode;
    this.httpCode = httpCode;
  }
};
