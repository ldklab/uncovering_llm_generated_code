const fs = require('fs');
const { Writable } = require('stream');
const { inherits } = require('util');
const { parseParams } = require('./utils');

class Busboy extends Writable {
  constructor(opts) {
    super({ highWaterMark: opts.highWaterMark });

    this._done = false;
    this._parser = undefined;
    this._finished = false;
    this.opts = opts;

    if (opts.headers && typeof opts.headers['content-type'] === 'string') {
      this.parseHeaders(opts.headers);
    } else {
      throw new Error('Missing Content-Type');
    }
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
    this._parser = undefined;
    if (headers['content-type']) {
      const parsed = parseParams(headers['content-type']);
      let matched = false;

      for (const type of TYPES) {
        if (typeof type.detect === 'function') {
          matched = type.detect(parsed);
        } else {
          matched = type.detect.test(parsed[0]);
        }
        if (matched) {
          const cfg = {
            limits: this.opts.limits,
            headers: headers,
            parsedConType: parsed,
            highWaterMark: this.opts.highWaterMark,
            fileHwm: this.opts.fileHwm,
            defCharset: this.opts.defCharset,
            preservePath: this.opts.preservePath || false
          };
          this._parser = type(this, cfg);
          return;
        }
      }
    }
    throw new Error(`Unsupported content type: ${headers['content-type']}`);
  }

  _write(chunk, encoding, cb) {
    if (!this._parser) {
      return cb(new Error('Not ready to parse. Missing Content-Type?'));
    }
    this._parser.write(chunk, cb);
  }
}

const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
];

module.exports = Busboy;
