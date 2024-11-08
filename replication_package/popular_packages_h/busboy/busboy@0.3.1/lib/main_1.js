const fs = require('fs');
const { Writable } = require('stream');
const { inherits } = require('util');
const { parseParams } = require('./utils');
const multipartType = require('./types/multipart');
const urlencodedType = require('./types/urlencoded');

class Busboy extends Writable {
  constructor(opts) {
    if (!opts.headers || typeof opts.headers['content-type'] !== 'string') {
      throw new Error('Missing Content-Type');
    }

    if (opts.highWaterMark !== undefined) {
      super({ highWaterMark: opts.highWaterMark });
    } else {
      super();
    }

    this._done = false;
    this._parser = null;
    this._finished = false;
    this.opts = opts;

    this.parseHeaders(opts.headers);
  }

  emit(ev, ...args) {
    if (ev === 'finish') {
      if (!this._done) {
        this._parser && this._parser.end();
        return;
      } else if (this._finished) {
        return;
      }
      this._finished = true;
    }
    super.emit(ev, ...args);
  }

  parseHeaders(headers) {
    this._parser = null;
    const contentType = headers['content-type'];
    const parsed = parseParams(contentType);
    let matched = false;
    let type;

    for (const currentType of TYPES) {
      type = currentType;
      matched = typeof type.detect === 'function' ? type.detect(parsed) : type.detect.test(parsed[0]);
      if (matched) break;
    }

    if (matched) {
      const config = {
        limits: this.opts.limits,
        headers,
        parsedConType: parsed,
        highWaterMark: this.opts.highWaterMark,
        fileHwm: this.opts.fileHwm,
        defCharset: this.opts.defCharset,
        preservePath: this.opts.preservePath || false,
      };
      
      this._parser = new type(this, config);
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  _write(chunk, encoding, callback) {
    if (!this._parser) {
      return callback(new Error('Not ready to parse. Missing Content-Type?'));
    }
    this._parser.write(chunk, callback);
  }
}

const TYPES = [multipartType, urlencodedType];

module.exports = Busboy;
