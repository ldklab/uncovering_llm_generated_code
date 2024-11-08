'use strict';

const { EventEmitter } = require('events');
const Stream = require('stream');
const Yallist = require('yallist');
const { StringDecoder } = require('string_decoder');

const EOF = Symbol('EOF');
const MAYBE_EMIT_END = Symbol('maybeEmitEnd');
const EMITTED_END = Symbol('emittedEnd');
const EMITTING_END = Symbol('emittingEnd');
const CLOSED = Symbol('closed');
const READ = Symbol('read');
const FLUSH = Symbol('flush');
const FLUSHCHUNK = Symbol('flushChunk');
const ENCODING = Symbol('encoding');
const DECODER = Symbol('decoder');
const FLOWING = Symbol('flowing');
const PAUSED = Symbol('paused');
const RESUME = Symbol('resume');
const BUFFERLENGTH = Symbol('bufferLength');
const BUFFERPUSH = Symbol('bufferPush');
const BUFFERSHIFT = Symbol('bufferShift');
const OBJECTMODE = Symbol('objectMode');
const DESTROYED = Symbol('destroyed');

class Minipass extends Stream {
  constructor(options = {}) {
    super();
    this[FLOWING] = false;
    this[PAUSED] = false;
    this.pipes = new Yallist();
    this.buffer = new Yallist();
    this[OBJECTMODE] = options.objectMode || false;
    this[ENCODING] = !this[OBJECTMODE] ? options.encoding || null : null;
    if (this[ENCODING] === 'buffer') this[ENCODING] = null;
    this[DECODER] = this[ENCODING] ? new StringDecoder(this[ENCODING]) : null;
    this[EOF] = false;
    this[EMITTED_END] = false;
    this[EMITTING_END] = false;
    this[CLOSED] = false;
    this.writable = true;
    this.readable = true;
    this[BUFFERLENGTH] = 0;
    this[DESTROYED] = false;
  }

  get bufferLength() {
    return this[BUFFERLENGTH];
  }

  get encoding() {
    return this[ENCODING];
  }

  set encoding(enc) {
    if (this[OBJECTMODE]) throw new Error('cannot set encoding in objectMode');
    if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH])) 
      throw new Error('cannot change encoding');
    if (this[ENCODING] !== enc) {
      this[DECODER] = enc ? new StringDecoder(enc) : null;
      if (this.buffer.length) {
        this.buffer = this.buffer.map(chunk => this[DECODER].write(chunk));
      }
    }
    this[ENCODING] = enc;
  }

  setEncoding(enc) {
    this.encoding = enc;
  }

  get objectMode() {
    return this[OBJECTMODE];
  }

  set objectMode(om) {
    this[OBJECTMODE] = this[OBJECTMODE] || !!om;
  }

  write(chunk, encoding, cb) {
    if (this[EOF]) throw new Error('write after end');
    if (this[DESTROYED]) {
      this.emit('error', Object.assign(new Error('Cannot call write after a stream was destroyed'), { code: 'ERR_STREAM_DESTROYED' }));
      return true;
    }

    if (typeof encoding === 'function') cb = encoding, encoding = 'utf8';
    if (!encoding) encoding = 'utf8';

    if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
      if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      else if (isArrayBuffer(chunk)) chunk = Buffer.from(chunk);
      else if (typeof chunk !== 'string') this.objectMode = true;
    }

    if (!this.objectMode && !chunk.length) {
      if (this[BUFFERLENGTH] !== 0) this.emit('readable');
      if (cb) cb();
      return this.flowing;
    }

    if (typeof chunk === 'string' && !this[OBJECTMODE] && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
      chunk = Buffer.from(chunk, encoding);
    }

    if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);

    if (this.flowing) {
      if (this[BUFFERLENGTH] !== 0) this[FLUSH](true);
      this.emit('data', chunk);
    } else {
      this[BUFFERPUSH](chunk);
    }

    if (this[BUFFERLENGTH] !== 0) this.emit('readable');
    if (cb) cb();

    return this.flowing;
  }

  read(n) {
    if (this[DESTROYED]) return null;

    try {
      if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) return null;
      if (this[OBJECTMODE]) n = null;
      if (this.buffer.length > 1 && !this[OBJECTMODE]) {
        if (this.encoding) {
          this.buffer = new Yallist([Array.from(this.buffer).join('')]);
        } else {
          this.buffer = new Yallist([Buffer.concat(Array.from(this.buffer), this[BUFFERLENGTH])]);
        }
      }
      return this[READ](n || null, this.buffer.head.value);
    } finally {
      this[MAYBE_EMIT_END]();
    }
  }

  [READ](n, chunk) {
    if (n === chunk.length || n === null) {
      this[BUFFERSHIFT]();
    } else {
      this.buffer.head.value = chunk.slice(n);
      chunk = chunk.slice(0, n);
      this[BUFFERLENGTH] -= n;
    }
    this.emit('data', chunk);
    if (!this.buffer.length && !this[EOF]) this.emit('drain');
    return chunk;
  }

  end(chunk, encoding, cb) {
    if (typeof chunk === 'function') cb = chunk, chunk = null;
    if (typeof encoding === 'function') cb = encoding, encoding = 'utf8';
    if (chunk) this.write(chunk, encoding);
    if (cb) this.once('end', cb);
    this[EOF] = true;
    this.writable = false;
    if (this.flowing || !this[PAUSED]) this[MAYBE_EMIT_END]();
    return this;
  }

  [RESUME]() {
    if (this[DESTROYED]) return;
    this[PAUSED] = false;
    this[FLOWING] = true;
    this.emit('resume');
    if (this.buffer.length) this[FLUSH]();
    else if (this[EOF]) this[MAYBE_EMIT_END]();
    else this.emit('drain');
  }

  resume() {
    return this[RESUME]();
  }

  pause() {
    this[FLOWING] = false;
    this[PAUSED] = true;
  }

  get destroyed() {
    return this[DESTROYED];
  }

  get flowing() {
    return this[FLOWING];
  }

  get paused() {
    return this[PAUSED];
  }

  [BUFFERPUSH](chunk) {
    if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1;
    else this[BUFFERLENGTH] += chunk.length;
    return this.buffer.push(chunk);
  }

  [BUFFERSHIFT]() {
    if (this.buffer.length) {
      if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1;
      else this[BUFFERLENGTH] -= this.buffer.head.value.length;
    }
    return this.buffer.shift();
  }

  [FLUSH](noDrain) {
    do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
    if (!noDrain && !this.buffer.length && !this[EOF]) this.emit('drain');
  }

  [FLUSHCHUNK](chunk) {
    return chunk ? (this.emit('data', chunk), this.flowing) : false;
  }

  pipe(dest, opts = {}) {
    if (this[DESTROYED]) return;
    const ended = this[EMITTED_END];
    if (dest === process.stdout || dest === process.stderr) opts.end = false;
    else opts.end = opts.end !== false;
    const p = { dest, opts, ondrain: () => this[RESUME]() };
    this.pipes.push(p);
    dest.on('drain', p.ondrain);
    this[RESUME]();
    if (ended && p.opts.end) p.dest.end();
    return dest;
  }

  addListener(ev, fn) {
    return this.on(ev, fn);
  }

  on(ev, fn) {
    try {
      return super.on(ev, fn);
    } finally {
      if (ev === 'data' && !this.pipes.length && !this.flowing) this[RESUME]();
      else if (isEndish(ev) && this[EMITTED_END]) {
        super.emit(ev);
        this.removeAllListeners(ev);
      }
    }
  }

  get emittedEnd() {
    return this[EMITTED_END];
  }

  [MAYBE_EMIT_END]() {
    if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
      this[EMITTING_END] = true;
      this.emit('end');
      this.emit('prefinish');
      this.emit('finish');
      if (this[CLOSED]) this.emit('close');
      this[EMITTING_END] = false;
    }
  }

  emit(ev, data) {
    if (ev !== 'error' && ev !== 'close' && ev !== DESTROYED && this[DESTROYED]) return;
    else if (ev === 'data') {
      if (!data) return;
      if (this.pipes.length) this.pipes.forEach(p => p.dest.write(data) === false && this.pause());
    } else if (ev === 'end') {
      if (this[EMITTED_END] === true) return;

      this[EMITTED_END] = true;
      this.readable = false;

      if (this[DECODER]) {
        data = this[DECODER].end();
        if (data) {
          this.pipes.forEach(p => p.dest.write(data));
          super.emit('data', data);
        }
      }

      this.pipes.forEach(p => {
        p.dest.removeListener('drain', p.ondrain);
        if (p.opts.end) p.dest.end();
      });
    } else if (ev === 'close') {
      this[CLOSED] = true;
      if (!this[EMITTED_END] && !this[DESTROYED]) return;
    }

    const args = new Array(arguments.length);
    args[0] = ev;
    args[1] = data;
    if (arguments.length > 2) {
      for (let i = 2; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
    }

    try {
      return super.emit.apply(this, args);
    } finally {
      if (!isEndish(ev)) this[MAYBE_EMIT_END]();
      else this.removeAllListeners(ev);
    }
  }

  collect() {
    const buf = [];
    if (!this[OBJECTMODE]) buf.dataLength = 0;
    const p = this.promise();
    this.on('data', c => {
      buf.push(c);
      if (!this[OBJECTMODE]) buf.dataLength += c.length;
    });
    return p.then(() => buf);
  }

  concat() {
    return this[OBJECTMODE]
      ? Promise.reject(new Error('cannot concat in objectMode'))
      : this.collect().then(buf => 
          this[OBJECTMODE]
            ? Promise.reject(new Error('cannot concat in objectMode'))
            : this[ENCODING] ? buf.join('') : Buffer.concat(buf, buf.dataLength));
  }

  promise() {
    return new Promise((resolve, reject) => {
      this.on(DESTROYED, () => reject(new Error('stream destroyed')));
      this.on('end', () => resolve());
      this.on('error', er => reject(er));
    });
  }

  [ASYNCITERATOR]() {
    const next = () => {
      const res = this.read();
      if (res !== null) return Promise.resolve({ done: false, value: res });
      if (this[EOF]) return Promise.resolve({ done: true });

      let resolve = null;
      let reject = null;
      const onerr = er => {
        this.removeListener('data', ondata);
        this.removeListener('end', onend);
        reject(er);
      };
      const ondata = value => {
        this.removeListener('error', onerr);
        this.removeListener('end', onend);
        this.pause();
        resolve({ value: value, done: !!this[EOF] });
      };
      const onend = () => {
        this.removeListener('error', onerr);
        this.removeListener('data', ondata);
        resolve({ done: true });
      };
      const ondestroy = () => onerr(new Error('stream destroyed'));
      return new Promise((res, rej) => {
        reject = rej;
        resolve = res;
        this.once(DESTROYED, ondestroy);
        this.once('error', onerr);
        this.once('end', onend);
        this.once('data', ondata);
      });
    };

    return { next };
  }

  [ITERATOR]() {
    const next = () => {
      const value = this.read();
      const done = value === null;
      return { value, done };
    };
    return { next };
  }

  destroy(er) {
    if (this[DESTROYED]) {
      if (er) this.emit('error', er);
      else this.emit(DESTROYED);
      return this;
    }

    this[DESTROYED] = true;
    this.buffer = new Yallist();
    this[BUFFERLENGTH] = 0;

    if (typeof this.close === 'function' && !this[CLOSED]) this.close();
    if (er) this.emit('error', er);
    else this.emit(DESTROYED);

    return this;
  }

  static isStream(s) {
    return !!s && (s instanceof Minipass || s instanceof Stream ||
      s instanceof EventEmitter && (
        typeof s.pipe === 'function' ||
        (typeof s.write === 'function' && typeof s.end === 'function')
      ));
  }
}

const isEndish = ev => ev === 'end' || ev === 'finish' || ev === 'prefinish';
const isArrayBuffer = b => b instanceof ArrayBuffer ||
  typeof b === 'object' &&
  b.constructor &&
  b.constructor.name === 'ArrayBuffer' &&
  b.byteLength >= 0;
const isArrayBufferView = b => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

module.exports = Minipass;
