const fs = require('fs');
const { Writable } = require('stream');
const { inherits } = require('util');
const parseParams = require('./utils').parseParams;

class Busboy extends Writable {
  constructor(opts) {
    if (!opts.headers || typeof opts.headers['content-type'] !== 'string') {
      throw new Error('Missing Content-Type');
    }
    super({ highWaterMark: opts.highWaterMark });
    
    this._done = false;
    this._parser = undefined;
    this._finished = false;
    this.opts = opts;

    this.parseHeaders(opts.headers);
  }

  emit(ev, ...args) {
    if (ev === 'finish') {
      if (!this._done) {
        this._parser?.end();
        return;
      } else if (this._finished) {
        return;
      }
      this._finished = true;
    }
    super.emit(ev, ...args);
  }

  parseHeaders(headers) {
    if (!headers['content-type']) {
      throw new Error('Unsupported content type: ' + headers['content-type']);
    }

    const parsed = parseParams(headers['content-type']);
    let matched = false;
    
    for (const type of TYPES) {
      matched = typeof type.detect === 'function' ? type.detect(parsed) : type.detect.test(parsed[0]);
      if (matched) {
        const cfg = {
          limits: this.opts.limits,
          headers,
          parsedConType: parsed,
          highWaterMark: this.opts.highWaterMark,
          fileHwm: this.opts.fileHwm,
          defCharset: this.opts.defCharset,
          preservePath: this.opts.preservePath,
        };
        this._parser = new type(this, cfg);
        return;
      }
    }

    throw new Error('Unsupported content type: ' + headers['content-type']);
  }

  _write(chunk, encoding, callback) {
    if (!this._parser) {
      return callback(new Error('Not ready to parse. Missing Content-Type?'));
    }
    this._parser.write(chunk, callback);
  }
}

const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
];

module.exports = Busboy;
