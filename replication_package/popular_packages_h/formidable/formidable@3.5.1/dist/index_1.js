'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const events = require('node:events');
const os = require('node:os');
const path = require('node:path');
const fsPromises = require('node:fs/promises');
const { StringDecoder } = require('node:string_decoder');
const Stream = require('node:stream');
const hexoid = require('hexoid');
const once = require('once');
const dezalgo = require('dezalgo');

class PersistentFile extends events.EventEmitter {
  constructor({ filepath, newFilename, originalFilename, mimetype, hashAlgorithm }) {
    super();
    Object.assign(this, { filepath, newFilename, originalFilename, mimetype, hashAlgorithm });
    this.lastModifiedDate = null;
    this.size = 0;
    this._writeStream = null;

    if (typeof hashAlgorithm === 'string') {
      this.hash = crypto.createHash(hashAlgorithm);
    } else {
      this.hash = null;
    }
  }

  open() {
    this._writeStream = fs.createWriteStream(this.filepath);
    this._writeStream.on('error', (err) => this.emit('error', err));
  }

  toJSON() {
    const json = {
      size: this.size,
      filepath: this.filepath,
      newFilename: this.newFilename,
      mimetype: this.mimetype,
      mtime: this.lastModifiedDate,
      originalFilename: this.originalFilename,
    };
    if (this.hash && this.hash !== '') {
      json.hash = this.hash;
    }
    return json;
  }

  write(buffer, cb) {
    if (this.hash) {
      this.hash.update(buffer);
    }
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

  destroy() {
    this._writeStream.destroy();
    setTimeout(() => fs.unlink(this.filepath, () => {}), 1);
  }
}

class VolatileFile extends events.EventEmitter {
  constructor({ filepath, newFilename, originalFilename, mimetype, hashAlgorithm, createFileWriteStream }) {
    super();
    Object.assign(this, { filepath, newFilename, originalFilename, mimetype, hashAlgorithm, createFileWriteStream });
    this.lastModifiedDate = null;
    this.size = 0;
    this._writeStream = null;

    if (typeof hashAlgorithm === 'string') {
      this.hash = crypto.createHash(hashAlgorithm);
    } else {
      this.hash = null;
    }
  }
  
  open() {
    this._writeStream = this.createFileWriteStream(this);
    this._writeStream.on('error', (err) => this.emit('error', err));
  }

  write(buffer, cb) {
    if (this.hash) {
      this.hash.update(buffer);
    }
    if (this._writeStream.closed || this._writeStream.destroyed) {
      cb();
      return;
    }
    this._writeStream.write(buffer, () => {
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

  destroy() {
    this._writeStream.destroy();
  }

  toJSON() {
    const json = {
      size: this.size,
      newFilename: this.newFilename,
      originalFilename: this.originalFilename,
      mimetype: this.mimetype,
    };
    if (this.hash && this.hash !== '') {
      json.hash = this.hash;
    }
    return json;
  }
}

class JSONParser extends Stream.Transform {
  constructor(options = {}) {
    super({ readableObjectMode: true });
    this.chunks = [];
    this.globalOptions = { ...options };
  }

  _transform(chunk, encoding, callback) {
    this.chunks.push(String(chunk));
    callback();
  }

  _flush(callback) {
    try {
      const fields = JSON.parse(this.chunks.join(''));
      this.push(fields);
    } catch (e) {
      callback(e);
      return;
    }
    this.chunks = null;
    callback();
  }
}

class QuerystringParser extends Stream.Transform {
  constructor(options = {}) {
    super({ readableObjectMode: true });
    this.globalOptions = { ...options };
    this.buffer = '';
    this.bufferLength = 0;
  }

  _transform(buffer, encoding, callback) {
    this.buffer += buffer.toString('ascii');
    this.bufferLength = this.buffer.length;
    callback();
  }

  _flush(callback) {
    const fields = new URLSearchParams(this.buffer);
    for (const [key, value] of fields) {
      this.push({ key, value });
    }
    this.buffer = '';
    callback();
  }
}

class OctetStreamParser extends Stream.PassThrough {
  constructor(options = {}) {
    super();
    this.globalOptions = { ...options };
  }
}

const toHexoId = hexoid(25);
const DEFAULT_OPTIONS = {
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
  enabledPlugins: [pluginOctetStream, pluginQueryString, pluginMultipart, pluginJson],
  fileWriteStreamHandler: null,
  defaultInvalidName: 'invalid-name',
  filter: () => true,
  filename: undefined,
};

const InvalidExtensionChar = (c) => {
  let code = c.charCodeAt(0);
  return !(
    code === 46 ||
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  );
};

class IncomingForm extends events.EventEmitter {
  constructor(options = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };

    const dir = path.resolve(this.options.uploadDir || os.tmpdir());
    this.uploadDir = dir;

    ['error', 'headers', 'type', 'bytesExpected', 'bytesReceived', '_parser', 'req'].forEach((key) => {
      this[key] = null;
    });

    this._setUpRename();
    this._flushing = 0;
    this._fieldsSize = 0;
    this._totalFileSize = 0;
    this.openedFiles = [];
    this.options.enabledPlugins = [].concat(this.options.enabledPlugins).filter(Boolean);

    if (this.options.enabledPlugins.length === 0) {
      throw new FormidableError('expect at least 1 enabled builtin plugin', missingPlugin);
    }

    this.options.enabledPlugins.forEach((plugin) => this.use(plugin));
    this._setUpMaxFields();
    this._setUpMaxFiles();
    this.ended = undefined;
  }

  async parse(req, cb) {
    this.req = req;
    let promise;

    if (!cb) {
      let resolveRef, rejectRef;
      promise = new Promise((resolve, reject) => {
        resolveRef = resolve;
        rejectRef = reject;
      });
      cb = (err, fields, files) => (err ? rejectRef(err) : resolveRef([fields, files]));
    }

    const callback = once(dezalgo(cb));
    this.fields = {};
    const files = {};

    this.on('field', (name, value) => {
      if (this.type === 'multipart' || this.type === 'urlencoded') {
        if (!this.fields.hasOwnProperty(name)) {
          this.fields[name] = [value];
        } else {
          this.fields[name].push(value);
        }
      } else {
        this.fields[name] = value;
      }
    });

    this.on('file', (name, file) => {
      if (!files.hasOwnProperty(name)) {
        files[name] = [file];
      } else {
        files[name].push(file);
      }
    });

    this.on('error', (err) => callback(err, this.fields, files));
    this.on('end', () => callback(null, this.fields, files));

    await this.writeHeaders(req.headers);

    req
      .on('error', (err) => this._error(err))
      .on('aborted', () => {
        this.emit('aborted');
        this._error(new FormidableError('Request aborted', aborted));
      })
      .on('data', (buffer) => {
        try {
          this.write(buffer);
        } catch (err) {
          this._error(err);
        }
      })
      .on('end', () => {
        if (this.error) return;
        if (this._parser) this._parser.end();
      });

    if (promise) return promise;
    return this;
  }

  async writeHeaders(headers) {
    this.headers = headers;
    this._parseContentLength();
    await this._parseContentType();

    if (!this._parser) {
      this._error(new FormidableError('no parser found', noParser, 415));
      return;
    }

    this._parser.once('error', (error) => this._error(error));
  }

  write(buffer) {
    if (this.error) return null;
    if (!this._parser) {
      this._error(new FormidableError('uninitialized parser', uninitializedParser));
      return null;
    }

    this.bytesReceived += buffer.length;
    this.emit('progress', this.bytesReceived, this.bytesExpected);
    this._parser.write(buffer);
    return this.bytesReceived;
  }

  onPart(part) {
    return this._handlePart(part);
  }

  async _handlePart(part) {
    if (part.originalFilename && typeof part.originalFilename !== 'string') {
      this._error(
        new FormidableError('the part.originalFilename should be a string', filenameNotString),
      );
      return;
    }

    if (!part.mimetype) {
      let value = '';
      const decoder = new StringDecoder(part.transferEncoding || this.options.encoding);

      part.on('data', (buffer) => {
        this._fieldsSize += buffer.length;
        if (this._fieldsSize > this.options.maxFieldsSize) {
          this._error(
            new FormidableError(
              `options.maxFieldsSize exceeded: ${this._fieldsSize}`,
              maxFieldsSizeExceeded,
              413,
            ),
          );
          return;
        }
        value += decoder.write(buffer);
      });

      part.on('end', () => this.emit('field', part.name, value));
      return;
    }

    if (!this.options.filter(part)) return;

    this._flushing += 1;
    let fileSize = 0;
    const newFilename = this._getNewName(part);
    const filepath = this._joinDirectoryName(newFilename);
    const file = await this._newFile({ newFilename, filepath, originalFilename: part.originalFilename, mimetype: part.mimetype });
    file.on('error', (err) => this._error(err));
    this.emit('fileBegin', part.name, file);

    file.open();
    this.openedFiles.push(file);

    part.on('data', (buffer) => {
      this._totalFileSize += buffer.length;
      fileSize += buffer.length;

      if (this._totalFileSize > this.options.maxTotalFileSize) {
        this._error(
          new FormidableError(
            `options.maxTotalFileSize exceeded: ${this._totalFileSize}`,
            biggerThanTotalMaxFileSize,
            413,
          ),
        );
        return;
      }
      if (buffer.length === 0) return;

      this.pause();
      file.write(buffer, () => this.resume());
    });

    part.on('end', () => {
      if (!this.options.allowEmptyFiles && fileSize === 0) {
        this._error(new FormidableError('options.allowEmptyFiles is false', noEmptyFiles, 400));
        return;
      }
      if (fileSize < this.options.minFileSize) {
        this._error(
          new FormidableError(
            `File size too small: ${fileSize}`,
            smallerThanMinFileSize,
            400,
          ),
        );
        return;
      }
      if (fileSize > this.options.maxFileSize) {
        this._error(
          new FormidableError(
            `File size too large: ${fileSize}`,
            biggerThanMaxFileSize,
            413,
          ),
        );
        return;
      }

      file.end(() => {
        this._flushing -= 1;
        this.emit('file', part.name, file);
        this._maybeEnd();
      });
    });
  }

  async _parseContentType() {
    if (this.bytesExpected === 0) {
      this._parser = new DummyParser(this, this.options);
      return;
    }

    if (!this.headers['content-type']) {
      this._error(
        new FormidableError(
          'bad content-type header, no content-type',
          missingContentType,
          400,
        ),
      );
      return;
    }

    new DummyParser(this, this.options);

    await Promise.all(this._plugins.map((plugin, idx) => plugin(this, this.options).catch((err) => {
      const error = new FormidableError(`plugin index ${idx} failed`, pluginFailed, 500);
      error.idx = idx;
      throw error;
    })));
  }

  _error(err, eventName = 'error') {
    if (this.error || this.ended) return;

    this.req = null;
    this.error = err;
    this.emit(eventName, err);

    this.openedFiles.forEach((file) => file.destroy());
  }

  _parseContentLength() {
    this.bytesReceived = 0;
    if (this.headers['content-length']) {
      this.bytesExpected = parseInt(this.headers['content-length'], 10);
    } else if (this.headers['transfer-encoding'] === undefined) {
      this.bytesExpected = 0;
    }

    if (this.bytesExpected !== null) {
      this.emit('progress', this.bytesReceived, this.bytesExpected);
    }
  }

  async _newFile({ filepath, originalFilename, mimetype, newFilename }) {
    if (this.options.fileWriteStreamHandler) {
      return new VolatileFile({
        newFilename,
        filepath,
        originalFilename,
        mimetype,
        createFileWriteStream: this.options.fileWriteStreamHandler,
        hashAlgorithm: this.options.hashAlgorithm,
      });
    }
    if (this.options.createDirsFromUploads) {
      try {
        await createNecessaryDirectoriesAsync(filepath);
      } catch (errorCreatingDir) {
        this._error(new FormidableError('cannot create directory', cannotCreateDir, 409));
      }
    }
    return new PersistentFile({
      newFilename,
      filepath,
      originalFilename,
      mimetype,
      hashAlgorithm: this.options.hashAlgorithm,
    });
  }
  
  _getFileExtension(str) {
    if (!str) return '';

    const basename = path.basename(str);
    const firstDot = basename.indexOf('.');
    const lastDot = basename.lastIndexOf('.');
    let rawExtname = path.extname(basename);

    if (firstDot !== lastDot) {
      rawExtname = basename.slice(firstDot);
    }

    return Array.from(rawExtname).findIndex(InvalidExtensionChar) === -1 ? rawExtname : '';
  }

  _joinDirectoryName(name) {
    const newPath = path.join(this.uploadDir, name);

    if (!newPath.startsWith(this.uploadDir)) {
      return path.join(this.uploadDir, this.options.defaultInvalidName);
    }

    return newPath;
  }

  _setUpRename() {
    if (typeof this.options.filename === 'function') {
      this._getNewName = (part) => {
        let ext = '';
        let name = this.options.defaultInvalidName;
        if (part.originalFilename) {
          ({ ext, name } = path.parse(part.originalFilename));
          if (this.options.keepExtensions !== true) {
            ext = '';
          }
        }
        return this.options.filename.call(this, name, ext, part, this);
      };
    } else {
      this._getNewName = (part) => {
        const name = toHexoId();

        if (part && this.options.keepExtensions) {
          const originalFilename = typeof part === 'string' ? part : part.originalFilename;
          return `${name}${this._getFileExtension(originalFilename)}`;
        }

        return name;
      };
    }
  }

  _setUpMaxFields() {
    if (this.options.maxFields !== Infinity) {
      let fieldsCount = 0;
      this.on('field', () => {
        fieldsCount += 1;
        if (fieldsCount > this.options.maxFields) {
          this._error(
            new FormidableError(
              `Too many fields: ${this.options.maxFields}`,
              maxFieldsExceeded,
              413,
            ),
          );
        }
      });
    }
  }

  _setUpMaxFiles() {
    if (this.options.maxFiles !== Infinity) {
      let fileCount = 0;
      this.on('fileBegin', () => {
        fileCount += 1;
        if (fileCount > this.options.maxFiles) {
          this._error(
            new FormidableError(
              `Too many files: ${this.options.maxFiles}`,
              maxFilesExceeded,
              413,
            ),
          );
        }
      });
    }
  }

  _maybeEnd() {
    if (!this.ended || this._flushing || this.error) return;
    this.req = null;
    this.emit('end');
  }
}

const formidable = (...args) => new IncomingForm(...args);
const enabledPlugins = DEFAULT_OPTIONS.enabledPlugins;

exports.DummyParser = DummyParser;
exports.File = PersistentFile;
exports.Formidable = IncomingForm;
exports.IncomingForm = IncomingForm;
exports.JSONParser = JSONParser;
exports.MultipartParser = MultipartParser;
exports.OctetStreamParser = OctetStreamParser;
exports.OctetstreamParser = OctetStreamParser;
exports.PersistentFile = PersistentFile;
exports.QueryStringParser = QuerystringParser;
exports.QuerystringParser = QuerystringParser;
exports.VolatileFile = VolatileFile;
exports.default = formidable;
exports.defaultOptions = DEFAULT_OPTIONS;
exports.enabledPlugins = enabledPlugins;
exports.errors = FormidableError;
exports.formidable = formidable;
exports.json = pluginJson;
exports.multipart = pluginMultipart;
exports.octetstream = pluginOctetStream;
exports.querystring = pluginQueryString;
