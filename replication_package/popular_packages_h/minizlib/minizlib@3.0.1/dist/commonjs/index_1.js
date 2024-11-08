"use strict";

const assert = require("assert");
const { Buffer } = require("buffer");
const Minipass = require("minipass");
const zlib = require("zlib");
const { constants } = require("./constants.js");

const OriginalBufferConcat = Buffer.concat;
const _superWrite = Symbol('_superWrite');

class ZlibError extends Error {
  constructor(err) {
    super('zlib: ' + err.message);
    this.code = err.code || 'ZLIB_ERROR';
    this.errno = err.errno;
    Error.captureStackTrace(this, this.constructor);
  }

  get name() {
    return 'ZlibError';
  }
}

const _flushFlag = Symbol('flushFlag');

class ZlibBase extends Minipass {
  #sawError = false;
  #ended = false;
  #flushFlag;
  #finishFlushFlag;
  #fullFlushFlag;
  #handle;
  #onError;

  get sawError() {
    return this.#sawError;
  }

  get handle() {
    return this.#handle;
  }
  
  get flushFlag() {
    return this.#flushFlag;
  }
  
  constructor(opts, mode) {
    if (!opts || typeof opts !== 'object') {
      throw new TypeError('invalid options for ZlibBase constructor');
    }
    super(opts);
    
    this.#flushFlag = opts.flush ?? 0;
    this.#finishFlushFlag = opts.finishFlush ?? 0;
    this.#fullFlushFlag = opts.fullFlushFlag ?? 0;

    try {
      this.#handle = new zlib[mode](opts);
    } catch (er) {
      throw new ZlibError(er);
    }

    this.#onError = err => {
      if (this.#sawError) return;
      this.#sawError = true;
      this.close();
      this.emit('error', err);
    };

    this.#handle?.on('error', er => this.#onError(new ZlibError(er)));
    this.once('end', () => this.close());
  }

  close() {
    if (this.#handle) {
      this.#handle.close();
      this.#handle = undefined;
      this.emit('close');
    }
  }

  reset() {
    if (!this.#sawError) {
      assert(this.#handle, 'zlib binding closed');
      return this.#handle.reset?.();
    }
  }

  flush(flushFlag) {
    if (this.ended) return;
    flushFlag = typeof flushFlag === 'number' ? flushFlag : this.#fullFlushFlag;
    this.write(Object.assign(Buffer.alloc(0), { [_flushFlag]: flushFlag }));
  }

  end(chunk, encoding, cb) {
    if (typeof chunk === 'function') {
      cb = chunk;
      encoding = undefined;
      chunk = undefined;
    }
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = undefined;
    }

    if (chunk) {
      if (encoding) this.write(chunk, encoding);
      else this.write(chunk);
    }
    this.flush(this.#finishFlushFlag);
    this.#ended = true;
    return super.end(cb);
  }
  
  get ended() {
    return this.#ended;
  }

  [_superWrite](data) {
    return super.write(data);
  }

  write(chunk, encoding, cb) {
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = 'utf8';
    }
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk, encoding);
    }
    if (this.#sawError) return;
    assert(this.#handle, 'zlib binding closed');

    const nativeHandle = this.#handle._handle;
    const originalNativeClose = nativeHandle.close;
    nativeHandle.close = () => {};
    const originalClose = this.#handle.close;
    this.#handle.close = () => {};

    Buffer.concat = args => args;
    let result;
    try {
      const flushFlag = typeof chunk[_flushFlag] === 'number' ? chunk[_flushFlag] : this.#flushFlag;
      result = this.#handle._processChunk(chunk, flushFlag);
      Buffer.concat = OriginalBufferConcat;
    } catch (err) {
      Buffer.concat = OriginalBufferConcat;
      this.#onError(new ZlibError(err));
    } finally {
      if (this.#handle) {
        this.#handle._handle = nativeHandle;
        nativeHandle.close = originalNativeClose;
        this.#handle.close = originalClose;
        this.#handle.removeAllListeners('error');
      }
    }

    if (this.#handle) this.#handle.on('error', er => this.#onError(new ZlibError(er)));

    let writeReturn;
    if (result) {
      if (Array.isArray(result) && result.length > 0) {
        const r = result[0];
        writeReturn = this[_superWrite](Buffer.from(r));
        for (let i = 1; i < result.length; i++) {
          writeReturn = this[_superWrite](result[i]);
        }
      } else {
        writeReturn = this[_superWrite](Buffer.from(result));
      }
    }
    if (cb) cb();
    return writeReturn;
  }
}

class Zlib extends ZlibBase {
  #level;
  #strategy;

  constructor(opts, mode) {
    opts = opts || {};
    opts.flush = opts.flush || constants.Z_NO_FLUSH;
    opts.finishFlush = opts.finishFlush || constants.Z_FINISH;
    opts.fullFlushFlag = constants.Z_FULL_FLUSH;
    super(opts, mode);
    this.#level = opts.level;
    this.#strategy = opts.strategy;
  }

  params(level, strategy) {
    if (this.sawError) return;
    if (!this.handle) throw new Error('cannot switch params when binding is closed');
    if (!this.handle.params) throw new Error('not supported in this implementation');
    if (this.#level !== level || this.#strategy !== strategy) {
      this.flush(constants.Z_SYNC_FLUSH);
      assert(this.handle, 'zlib binding closed');

      const origFlush = this.handle.flush;
      this.handle.flush = (flushFlag, cb) => {
        if (typeof flushFlag === 'function') {
          cb = flushFlag;
          flushFlag = this.flushFlag;
        }
        this.flush(flushFlag);
        cb?.();
      };
      try {
        this.handle.params(level, strategy);
      } finally {
        this.handle.flush = origFlush;
      }
      if (this.handle) {
        this.#level = level;
        this.#strategy = strategy;
      }
    }
  }
}

class Deflate extends Zlib {
  constructor(opts) {
    super(opts, 'Deflate');
  }
}

class Inflate extends Zlib {
  constructor(opts) {
    super(opts, 'Inflate');
  }
}

class Gzip extends Zlib {
  #portable;

  constructor(opts) {
    super(opts, 'Gzip');
    this.#portable = opts && !!opts.portable;
  }

  [_superWrite](data) {
    if (!this.#portable) return super[_superWrite](data);
    this.#portable = false;
    data[9] = 255;
    return super[_superWrite](data);
  }
}

class Gunzip extends Zlib {
  constructor(opts) {
    super(opts, 'Gunzip');
  }
}

class DeflateRaw extends Zlib {
  constructor(opts) {
    super(opts, 'DeflateRaw');
  }
}

class InflateRaw extends Zlib {
  constructor(opts) {
    super(opts, 'InflateRaw');
  }
}

class Unzip extends Zlib {
  constructor(opts) {
    super(opts, 'Unzip');
  }
}

class Brotli extends ZlibBase {
  constructor(opts, mode) {
    opts = opts || {};
    opts.flush = opts.flush || constants.BROTLI_OPERATION_PROCESS;
    opts.finishFlush = opts.finishFlush || constants.BROTLI_OPERATION_FINISH;
    opts.fullFlushFlag = constants.BROTLI_OPERATION_FLUSH;
    super(opts, mode);
  }
}

class BrotliCompress extends Brotli {
  constructor(opts) {
    super(opts, 'BrotliCompress');
  }
}

class BrotliDecompress extends Brotli {
  constructor(opts) {
    super(opts, 'BrotliDecompress');
  }
}

module.exports = {
  ZlibError,
  Zlib,
  Deflate,
  Inflate,
  Gzip,
  Gunzip,
  DeflateRaw,
  InflateRaw,
  Unzip,
  Brotli,
  BrotliCompress,
  BrotliDecompress,
  constants
};
