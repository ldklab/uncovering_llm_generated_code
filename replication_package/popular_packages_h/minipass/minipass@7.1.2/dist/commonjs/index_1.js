"use strict";

const { EventEmitter } = require("node:events");
const Stream = require("node:stream");
const { StringDecoder } = require("node:string_decoder");

const proc = typeof process === 'object' && process ? process : { stdout: null, stderr: null };

const isStream = (s) => !!s && typeof s === 'object' && (
  s instanceof Minipass || s instanceof Stream ||
  isReadable(s) || isWritable(s)
);

const isReadable = (s) => !!s && typeof s === 'object' &&
  s instanceof EventEmitter && typeof s.pipe === 'function' &&
  s.pipe !== Stream.Writable.prototype.pipe;

const isWritable = (s) => !!s && typeof s === 'object' &&
  s instanceof EventEmitter && typeof s.write === 'function' &&
  typeof s.end === 'function';

const symbols = {
  EOF: Symbol('EOF'),
  MAYBE_EMIT_END: Symbol('maybeEmitEnd'),
  EMITTED_END: Symbol('emittedEnd'),
  EMITTING_END: Symbol('emittingEnd'),
  EMITTED_ERROR: Symbol('emittedError'),
  CLOSED: Symbol('closed'),
  READ: Symbol('read'),
  FLUSH: Symbol('flush'),
  FLUSHCHUNK: Symbol('flushChunk'),
  ENCODING: Symbol('encoding'),
  DECODER: Symbol('decoder'),
  FLOWING: Symbol('flowing'),
  PAUSED: Symbol('paused'),
  RESUME: Symbol('resume'),
  BUFFER: Symbol('buffer'),
  PIPES: Symbol('pipes'),
  BUFFERLENGTH: Symbol('bufferLength'),
  BUFFERPUSH: Symbol('bufferPush'),
  BUFFERSHIFT: Symbol('bufferShift'),
  OBJECTMODE: Symbol('objectMode'),
  DESTROYED: Symbol('destroyed'),
  ERROR: Symbol('error'),
  EMITDATA: Symbol('emitData'),
  EMITEND: Symbol('emitEnd'),
  EMITEND2: Symbol('emitEnd2'),
  ASYNC: Symbol('async'),
  ABORT: Symbol('abort'),
  ABORTED: Symbol('aborted'),
  SIGNAL: Symbol('signal'),
  DATALISTENERS: Symbol('dataListeners'),
  DISCARDED: Symbol('discarded')
};

const defer = (fn) => Promise.resolve().then(fn);
const nodefer = (fn) => fn();

class Pipe {
  constructor(src, dest, opts) {
    this.src = src;
    this.dest = dest;
    this.opts = opts;
    this.ondrain = () => src[symbols.RESUME]();
    this.dest.on('drain', this.ondrain);
  }

  unpipe() {
    this.dest.removeListener('drain', this.ondrain);
  }

  /* c8 ignore start */
  proxyErrors(_er) {}
  /* c8 ignore stop */

  end() {
    this.unpipe();
    if (this.opts.end) this.dest.end();
  }
}

class PipeProxyErrors extends Pipe {
  constructor(src, dest, opts) {
    super(src, dest, opts);
    this.proxyErrors = (er) => dest.emit('error', er);
    src.on('error', this.proxyErrors);
  }

  unpipe() {
    this.src.removeListener('error', this.proxyErrors);
    super.unpipe();
  }
}

class Minipass extends EventEmitter {
  constructor(...args) {
    const options = args[0] || {};
    super();

    if (options.objectMode && typeof options.encoding === 'string') {
      throw new TypeError('Encoding and objectMode may not be used together');
    }

    this[symbols.OBJECTMODE] = !!options.objectMode;
    this[symbols.ENCODING] = options.encoding || null;

    if (!this[symbols.OBJECTMODE] && this[symbols.ENCODING]) {
      this[symbols.ENCODING] = options.encoding;
      this[symbols.OBJECTMODE] = false;
    } else {
      this[symbols.OBJECTMODE] = false;
      this[symbols.ENCODING] = null;
    }

    this[symbols.ASYNC] = !!options.async;
    this[symbols.DECODER] = this[symbols.ENCODING]
      ? new StringDecoder(this[symbols.ENCODING])
      : null;

    if (options.debugExposeBuffer === true) {
      Object.defineProperty(this, 'buffer', { get: () => this[symbols.BUFFER] });
    }

    if (options.debugExposePipes === true) {
      Object.defineProperty(this, 'pipes', { get: () => this[symbols.PIPES] });
    }

    const { signal } = options;
    if (signal) {
      this[symbols.SIGNAL] = signal;
      if (signal.aborted) {
        this[symbols.ABORT]();
      } else {
        signal.addEventListener('abort', () => this[symbols.ABORT]());
      }
    }

    this[symbols.FLOWING] = false;
    this[symbols.PAUSED] = false;
    this[symbols.PIPES] = [];
    this[symbols.BUFFER] = [];
    this[symbols.EOF] = false;
    this[symbols.EMITTED_END] = false;
    this[symbols.EMITTING_END] = false;
    this[symbols.CLOSED] = false;
    this[symbols.EMITTED_ERROR] = null;
    this[symbols.BUFFERLENGTH] = 0;
    this[symbols.DESTROYED] = false;
    this[symbols.SIGNAL] = undefined;
    this[symbols.ABORTED] = false;
    this[symbols.DATALISTENERS] = 0;
    this[symbols.DISCARDED] = false;
    this.writable = true;
    this.readable = true;
  }

  get bufferLength() {
    return this[symbols.BUFFERLENGTH];
  }

  get encoding() {
    return this[symbols.ENCODING];
  }

  set encoding(_enc) {
    throw new Error('Encoding must be set at instantiation time');
  }

  setEncoding(_enc) {
    throw new Error('Encoding must be set at instantiation time');
  }

  get objectMode() {
    return this[symbols.OBJECTMODE];
  }

  set objectMode(_om) {
    throw new Error('objectMode must be set at instantiation time');
  }

  get async() {
    return this[symbols.ASYNC];
  }

  set async(a) {
    this[symbols.ASYNC] = this[symbols.ASYNC] || !!a;
  }

  [symbols.ABORT]() {
    this[symbols.ABORTED] = true;
    this.emit('abort', this[symbols.SIGNAL]?.reason);
    this.destroy(this[symbols.SIGNAL]?.reason);
  }

  get aborted() {
    return this[symbols.ABORTED];
  }

  set aborted(_) {}

  write(chunk, encoding, cb) {
    if (this[symbols.ABORTED]) return false;
    if (this[symbols.EOF]) throw new Error('write after end');
    if (this[symbols.DESTROYED]) {
      this.emit('error', Object.assign(new Error('Cannot call write after a stream was destroyed'), { code: 'ERR_STREAM_DESTROYED' }));
      return true;
    }
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = 'utf8';
    }
    if (!encoding) encoding = 'utf8';
    const fn = this[symbols.ASYNC] ? defer : nodefer;

    if (!this[symbols.OBJECTMODE] && !Buffer.isBuffer(chunk)) {
      if (Buffer.isView(chunk)) {
        chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      } else if (chunk instanceof ArrayBuffer || Object.prototype.toString.call(chunk) == '[object ArrayBuffer]') {
        chunk = Buffer.from(chunk);
      } else if (typeof chunk !== 'string') {
        throw new Error('Non-contiguous data written to non-objectMode stream');
      }
    }

    if (this[symbols.OBJECTMODE]) {
      if (this[symbols.FLOWING] && this[symbols.BUFFERLENGTH] !== 0) this[symbols.FLUSH](true);
      if (this[symbols.FLOWING]) this.emit('data', chunk);
      else this[symbols.BUFFERPUSH](chunk);
      if (this[symbols.BUFFERLENGTH] !== 0) this.emit('readable');
      if (cb) fn(cb);
      return this[symbols.FLOWING];
    }

    if (!chunk.length) {
      if (this[symbols.BUFFERLENGTH] !== 0) this.emit('readable');
      if (cb) fn(cb);
      return this[symbols.FLOWING];
    }

    if (typeof chunk === 'string' && !(encoding === this[symbols.ENCODING] && !this[symbols.DECODER]?.lastNeed)) {
      chunk = Buffer.from(chunk, encoding);
    }

    if (Buffer.isBuffer(chunk) && this[symbols.ENCODING]) {
      chunk = this[symbols.DECODER].write(chunk);
    }

    if (this[symbols.FLOWING] && this[symbols.BUFFERLENGTH] !== 0) this[symbols.FLUSH](true);
    if (this[symbols.FLOWING]) this.emit('data', chunk);
    else this[symbols.BUFFERPUSH](chunk);
    if (this[symbols.BUFFERLENGTH] !== 0) this.emit('readable');
    if (cb) fn(cb);
    return this[symbols.FLOWING];
  }

  read(n) {
    if (this[symbols.DESTROYED]) return null;
    this[symbols.DISCARDED] = false;
    if (this[symbols.BUFFERLENGTH] === 0 || n === 0 || (n && n > this[symbols.BUFFERLENGTH])) {
      this[symbols.MAYBE_EMIT_END]();
      return null;
    }
    if (this[symbols.OBJECTMODE]) n = null;
    if (this[symbols.BUFFER].length > 1 && !this[symbols.OBJECTMODE]) {
      this[symbols.BUFFER] = [
        (this[symbols.ENCODING] ?
          this[symbols.BUFFER].join('') :
          Buffer.concat(this[symbols.BUFFER], this[symbols.BUFFERLENGTH))
      ];
    }
    const ret = this[symbols.READ](n || null, this[symbols.BUFFER][0]);
    this[symbols.MAYBE_EMIT_END]();
    return ret;
  }

  [symbols.READ](n, chunk) {
    if (this[symbols.OBJECTMODE]) this[symbols.BUFFERSHIFT]();
    else {
      const c = chunk;
      if (n === c.length || n === null) this[symbols.BUFFERSHIFT]();
      else if (typeof c === 'string') {
        this[symbols.BUFFER][0] = c.slice(n);
        chunk = c.slice(0, n);
        this[symbols.BUFFERLENGTH] -= n;
      } else {
        this[symbols.BUFFER][0] = c.subarray(n);
        chunk = c.subarray(0, n);
        this[symbols.BUFFERLENGTH] -= n;
      }
    }
    this.emit('data', chunk);
    if (!this[symbols.BUFFER].length && !this[symbols.EOF]) this.emit('drain');
    return chunk;
  }

  end(chunk, encoding, cb) {
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = undefined;
    }
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = 'utf8';
    }
    if (chunk !== undefined) this.write(chunk, encoding);
    if (cb) this.once('end', cb);
    this[symbols.EOF] = true;
    this.writable = false;
    if (this[symbols.FLOWING] || !this[symbols.PAUSED]) this[symbols.MAYBE_EMIT_END]();
    return this;
  }

  [symbols.RESUME]() {
    if (this[symbols.DESTROYED]) return;
    if (!this[symbols.DATALISTENERS] && !this[symbols.PIPES].length) {
      this[symbols.DISCARDED] = true;
    }
    this[symbols.PAUSED] = false;
    this[symbols.FLOWING] = true;
    this.emit('resume');
    if (this[symbols.BUFFER].length) this[symbols.FLUSH]();
    else if (this[symbols.EOF]) this[symbols.MAYBE_EMIT_END]();
    else this.emit('drain');
  }

  resume() {
    return this[symbols.RESUME]();
  }

  pause() {
    this[symbols.FLOWING] = false;
    this[symbols.PAUSED] = true;
    this[symbols.DISCARDED] = false;
  }

  get destroyed() {
    return this[symbols.DESTROYED];
  }

  get flowing() {
    return this[symbols.FLOWING];
  }

  get paused() {
    return this[symbols.PAUSED];
  }

  [symbols.BUFFERPUSH](chunk) {
    if (this[symbols.OBJECTMODE]) this[symbols.BUFFERLENGTH] += 1;
    else this[symbols.BUFFERLENGTH] += chunk.length;
    this[symbols.BUFFER].push(chunk);
  }

  [symbols.BUFFERSHIFT]() {
    if (this[symbols.OBJECTMODE]) this[symbols.BUFFERLENGTH] -= 1;
    else this[symbols.BUFFERLENGTH] -= this[symbols.BUFFER][0].length;
    return this[symbols.BUFFER].shift();
  }

  [symbols.FLUSH](noDrain = false) {
    do { } while (this[symbols.FLUSHCHUNK](this[symbols.BUFFERSHIFT]()) &&
      this[symbols.BUFFER].length);
    if (!noDrain && !this[symbols.BUFFER].length && !this[symbols.EOF]) this.emit('drain');
  }

  [symbols.FLUSHCHUNK](chunk) {
    this.emit('data', chunk);
    return this[symbols.FLOWING];
  }

  pipe(dest, opts) {
    if (this[symbols.DESTROYED]) return dest;
    this[symbols.DISCARDED] = false;
    const ended = this[symbols.EMITTED_END];
    opts = opts || {};
    if (dest === proc.stdout || dest === proc.stderr) opts.end = false;
    else opts.end = opts.end !== false;

    opts.proxyErrors = !!opts.proxyErrors;
    if (ended) {
      if (opts.end) dest.end();
    } else {
      this[symbols.PIPES].push(!opts.proxyErrors ?
        new Pipe(this, dest, opts) :
        new PipeProxyErrors(this, dest, opts));
      if (this[symbols.ASYNC]) defer(() => this[symbols.RESUME]());
      else this[symbols.RESUME]();
    }
    return dest;
  }

  unpipe(dest) {
    const p = this[symbols.PIPES].find(p => p.dest === dest);
    if (p) {
      if (this[symbols.PIPES].length === 1) {
        if (this[symbols.FLOWING] && this[symbols.DATALISTENERS] === 0) {
          this[symbols.FLOWING] = false;
        }
        this[symbols.PIPES] = [];
      } else this[symbols.PIPES].splice(this[symbols.PIPES].indexOf(p), 1);
      p.unpipe();
    }
  }

  addListener(ev, handler) {
    return this.on(ev, handler);
  }

  on(ev, handler) {
    const ret = super.on(ev, handler);
    if (ev === 'data') {
      this[symbols.DISCARDED] = false;
      this[symbols.DATALISTENERS]++;
      if (!this[symbols.PIPES].length && !this[symbols.FLOWING]) {
        this[symbols.RESUME]();
      }
    } else if (ev === 'readable' && this[symbols.BUFFERLENGTH] !== 0) {
      super.emit('readable');
    } else if (['end', 'finish', 'prefinish'].includes(ev) && this[symbols.EMITTED_END]) {
      super.emit(ev);
      this.removeAllListeners(ev);
    } else if (ev === 'error' && this[symbols.EMITTED_ERROR]) {
      const h = handler;
      if (this[symbols.ASYNC]) defer(() => h.call(this, this[symbols.EMITTED_ERROR]));
      else h.call(this, this[symbols.EMITTED_ERROR]);
    }
    return ret;
  }

  removeListener(ev, handler) {
    return this.off(ev, handler);
  }

  off(ev, handler) {
    const ret = super.off(ev, handler);
    if (ev === 'data') {
      this[symbols.DATALISTENERS] = this.listeners('data').length;
      if (this[symbols.DATALISTENERS] === 0 &&
        !this[symbols.DISCARDED] &&
        !this[symbols.PIPES].length) {
        this[symbols.FLOWING] = false;
      }
    }
    return ret;
  }

  removeAllListeners(ev) {
    const ret = super.removeAllListeners(ev);
    if (ev === 'data' || ev === undefined) {
      this[symbols.DATALISTENERS] = 0;
      if (!this[symbols.DISCARDED] && !this[symbols.PIPES].length) {
        this[symbols.FLOWING] = false;
      }
    }
    return ret;
  }

  get emittedEnd() {
    return this[symbols.EMITTED_END];
  }

  [symbols.MAYBE_EMIT_END]() {
    if (!this[symbols.EMITTING_END] &&
      !this[symbols.EMITTED_END] &&
      !this[symbols.DESTROYED] &&
      this[symbols.BUFFER].length === 0 &&
      this[symbols.EOF]) {
      this[symbols.EMITTING_END] = true;
      this.emit('end');
      this.emit('prefinish');
      this.emit('finish');
      if (this[symbols.CLOSED]) this.emit('close');
      this[symbols.EMITTING_END] = false;
    }
  }

  emit(ev, ...args) {
    const data = args[0];
    if (ev !== 'error' &&
      ev !== 'close' &&
      ev !== symbols.DESTROYED &&
      this[symbols.DESTROYED]) {
      return false;
    } else if (ev === 'data') {
      return !this[symbols.OBJECTMODE] && !data
        ? false
        : this[symbols.ASYNC]
          ? (defer(() => this[symbols.EMITDATA](data)), true)
          : this[symbols.EMITDATA](data);
    } else if (ev === 'end') {
      return this[symbols.EMITEND]();
    } else if (ev === 'close') {
      this[symbols.CLOSED] = true;
      if (!this[symbols.EMITTED_END] && !this[symbols.DESTROYED]) return false;
      const ret = super.emit('close');
      this.removeAllListeners('close');
      return ret;
    } else if (ev === 'error') {
      this[symbols.EMITTED_ERROR] = data;
      super.emit(symbols.ERROR, data);
      const ret = !this[symbols.SIGNAL] || this.listeners('error').length
        ? super.emit('error', data)
        : false;
      this[symbols.MAYBE_EMIT_END]();
      return ret;
    } else if (ev === 'resume') {
      const ret = super.emit('resume');
      this[symbols.MAYBE_EMIT_END]();
      return ret;
    } else if (ev === 'finish' || ev === 'prefinish') {
      const ret = super.emit(ev);
      this.removeAllListeners(ev);
      return ret;
    }
    const ret = super.emit(ev, ...args);
    this[symbols.MAYBE_EMIT_END]();
    return ret;
  }

  [symbols.EMITDATA](data) {
    for (const p of this[symbols.PIPES]) {
      if (p.dest.write(data) === false) this.pause();
    }
    const ret = this[symbols.DISCARDED] ? false : super.emit('data', data);
    this[symbols.MAYBE_EMIT_END]();
    return ret;
  }

  [symbols.EMITEND]() {
    if (this[symbols.EMITTED_END]) return false;
    this[symbols.EMITTED_END] = true;
    this.readable = false;
    return this[symbols.ASYNC]
      ? (defer(() => this[symbols.EMITEND2]()), true)
      : this[symbols.EMITEND2]();
  }

  [symbols.EMITEND2]() {
    if (this[symbols.DECODER]) {
      const data = this[symbols.DECODER].end();
      if (data) {
        for (const p of this[symbols.PIPES]) {
          p.dest.write(data);
        }
        if (!this[symbols.DISCARDED]) super.emit('data', data);
      }
    }
    for (const p of this[symbols.PIPES]) {
      p.end();
    }
    const ret = super.emit('end');
    this.removeAllListeners('end');
    return ret;
  }

  async collect() {
    const buf = Object.assign([], {
      dataLength: 0,
    });
    if (!this[symbols.OBJECTMODE]) buf.dataLength = 0;
    const p = this.promise();
    this.on('data', c => {
      buf.push(c);
      if (!this[symbols.OBJECTMODE]) buf.dataLength += c.length;
    });
    await p;
    return buf;
  }

  async concat() {
    if (this[symbols.OBJECTMODE]) {
      throw new Error('cannot concat in objectMode');
    }
    const buf = await this.collect();
    return (this[symbols.ENCODING]
      ? buf.join('')
      : Buffer.concat(buf, buf.dataLength));
  }

  async promise() {
    return new Promise((resolve, reject) => {
      this.on(symbols.DESTROYED, () => reject(new Error('stream destroyed')));
      this.on('error', er => reject(er));
      this.on('end', () => resolve());
    });
  }

  [Symbol.asyncIterator]() {
    this[symbols.DISCARDED] = false;
    let stopped = false;
    const stop = async () => {
      this.pause();
      stopped = true;
      return { value: undefined, done: true };
    };
    const next = () => {
      if (stopped) return stop();
      const res = this.read();
      if (res !== null) return Promise.resolve({ done: false, value: res });
      if (this[symbols.EOF]) return stop();
      return new Promise((res, rej) => {
        let resolve;
        let reject;
        const onerr = (er) => {
          this.off('data', ondata);
          this.off('end', onend);
          this.off(symbols.DESTROYED, ondestroy);
          stop();
          reject(er);
        };
        const ondata = (value) => {
          this.off('error', onerr);
          this.off('end', onend);
          this.off(symbols.DESTROYED, ondestroy);
          this.pause();
          resolve({ value, done: !!this[symbols.EOF] });
        };
        const onend = () => {
          this.off('error', onerr);
          this.off('data', ondata);
          this.off(symbols.DESTROYED, ondestroy);
          stop();
          resolve({ done: true, value: undefined });
        };
        const ondestroy = () => onerr(new Error('stream destroyed'));
        reject = rej;
        resolve = res;
        this.once(symbols.DESTROYED, ondestroy);
        this.once('error', onerr);
        this.once('end', onend);
        this.once('data', ondata);
      });
    };
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  [Symbol.iterator]() {
    this[symbols.DISCARDED] = false;
    let stopped = false;
    const stop = () => {
      this.pause();
      this.off(symbols.ERROR, stop);
      this.off(symbols.DESTROYED, stop);
      this.off('end', stop);
      stopped = true;
      return { done: true, value: undefined };
    };
    const next = () => {
      if (stopped) return stop();
      const value = this.read();
      return value === null ? stop() : { done: false, value };
    };
    this.once('end', stop);
    this.once(symbols.ERROR, stop);
    this.once(symbols.DESTROYED, stop);
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  destroy(er) {
    if (this[symbols.DESTROYED]) {
      if (er) this.emit('error', er);
      else this.emit(symbols.DESTROYED);
      return this;
    }
    this[symbols.DESTROYED] = true;
    this[symbols.DISCARDED] = true;
    this[symbols.BUFFER].length = 0;
    this[symbols.BUFFERLENGTH] = 0;
    if (typeof this.close === 'function' && !this[symbols.CLOSED]) this.close();
    if (er) this.emit('error', er);
    else this.emit(symbols.DESTROYED);
    return this;
  }

  static get isStream() {
    return isStream;
  }
}

module.exports = { Minipass, isWritable, isReadable, isStream };
