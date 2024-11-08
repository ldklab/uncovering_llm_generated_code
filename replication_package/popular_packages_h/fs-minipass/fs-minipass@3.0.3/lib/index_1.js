'use strict';

const { Minipass } = require('minipass');
const { EventEmitter } = require('events');
const fs = require('fs');
const writev = fs.writev;

const SYMBOLS = {
  autoClose: Symbol('autoClose'),
  close: Symbol('close'),
  errored: Symbol('errored'),
  fd: Symbol('fd'),
  flags: Symbol('flags'),
  handleChunk: Symbol('handleChunk'),
  makeBuf: Symbol('makeBuf'),
  mode: Symbol('mode'),
  needDrain: Symbol('needDrain'),
  onOpen: Symbol('onOpen'),
  onError: Symbol('onError'),
  onRead: Symbol('onRead'),
  onWrite: Symbol('onWrite'),
  open: Symbol('open'),
  path: Symbol('path'),
  pos: Symbol('pos'),
  queue: Symbol('queue'),
  read: Symbol('read'),
  readSize: Symbol('readSize'),
  reading: Symbol('reading'),
  remain: Symbol('remain'),
  size: Symbol('size'),
  write: Symbol('write'),
  writing: Symbol('writing'),
  defaultFlag: Symbol('defaultFlag')
};

class ReadStream extends Minipass {
  constructor(path, opt = {}) {
    super(opt);
    this.readable = true;
    this.writable = false;

    if (typeof path !== 'string') {
      throw new TypeError('path must be a string');
    }

    this[SYMBOLS.errored] = false;
    this[SYMBOLS.fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[SYMBOLS.path] = path;
    this[SYMBOLS.readSize] = opt.readSize || 16 * 1024 * 1024;
    this[SYMBOLS.reading] = false;
    this[SYMBOLS.size] = typeof opt.size === 'number' ? opt.size : Infinity;
    this[SYMBOLS.remain] = this[SYMBOLS.size];
    this[SYMBOLS.autoClose] = typeof opt.autoClose === 'boolean' ? opt.autoClose : true;

    if (typeof this[SYMBOLS.fd] === 'number') {
      this[SYMBOLS.read]();
    } else {
      this[SYMBOLS.open]();
    }
  }

  get fd() {
    return this[SYMBOLS.fd];
  }

  get path() {
    return this[SYMBOLS.path];
  }

  write() {
    throw new TypeError('this is a readable stream');
  }

  end() {
    throw new TypeError('this is a readable stream');
  }

  [SYMBOLS.open]() {
    fs.open(this[SYMBOLS.path], 'r', (er, fd) => this[SYMBOLS.onOpen](er, fd));
  }

  [SYMBOLS.onOpen](er, fd) {
    if (er) {
      this[SYMBOLS.onError](er);
    } else {
      this[SYMBOLS.fd] = fd;
      this.emit('open', fd);
      this[SYMBOLS.read]();
    }
  }

  [SYMBOLS.makeBuf]() {
    return Buffer.allocUnsafe(Math.min(this[SYMBOLS.readSize], this[SYMBOLS.remain]));
  }

  [SYMBOLS.read]() {
    if (!this[SYMBOLS.reading]) {
      this[SYMBOLS.reading] = true;
      const buf = this[SYMBOLS.makeBuf]();
      if (buf.length === 0) {
        return process.nextTick(() => this[SYMBOLS.onRead](null, 0, buf));
      }
      fs.read(this[SYMBOLS.fd], buf, 0, buf.length, null, (er, br, b) =>
        this[SYMBOLS.onRead](er, br, b)
      );
    }
  }

  [SYMBOLS.onRead](er, br, buf) {
    this[SYMBOLS.reading] = false;
    if (er) {
      this[SYMBOLS.onError](er);
    } else if (this[SYMBOLS.handleChunk](br, buf)) {
      this[SYMBOLS.read]();
    }
  }

  [SYMBOLS.close]() {
    if (this[SYMBOLS.autoClose] && typeof this[SYMBOLS.fd] === 'number') {
      const fd = this[SYMBOLS.fd];
      this[SYMBOLS.fd] = null;
      fs.close(fd, (er) => (er ? this.emit('error', er) : this.emit('close')));
    }
  }

  [SYMBOLS.onError](er) {
    this[SYMBOLS.reading] = true;
    this[SYMBOLS.close]();
    this.emit('error', er);
  }

  [SYMBOLS.handleChunk](br, buf) {
    let ret = false;
    this[SYMBOLS.remain] -= br;
    if (br > 0) {
      ret = super.write(br < buf.length ? buf.slice(0, br) : buf);
    }

    if (br === 0 || this[SYMBOLS.remain] <= 0) {
      ret = false;
      this[SYMBOLS.close]();
      super.end();
    }

    return ret;
  }

  emit(ev, data) {
    switch (ev) {
      case 'prefinish':
      case 'finish':
        break;

      case 'drain':
        if (typeof this[SYMBOLS.fd] === 'number') {
          this[SYMBOLS.read]();
        }
        break;

      case 'error':
        if (this[SYMBOLS.errored]) {
          return;
        }
        this[SYMBOLS.errored] = true;
        return super.emit(ev, data);

      default:
        return super.emit(ev, data);
    }
  }
}

class ReadStreamSync extends ReadStream {
  [SYMBOLS.open]() {
    let threw = true;
    try {
      this[SYMBOLS.onOpen](null, fs.openSync(this[SYMBOLS.path], 'r'));
      threw = false;
    } finally {
      if (threw) {
        this[SYMBOLS.close]();
      }
    }
  }

  [SYMBOLS.read]() {
    let threw = true;
    try {
      if (!this[SYMBOLS.reading]) {
        this[SYMBOLS.reading] = true;
        do {
          const buf = this[SYMBOLS.makeBuf]();
          const br = buf.length === 0 ? 0 : fs.readSync(this[SYMBOLS.fd], buf, 0, buf.length, null);
          if (!this[SYMBOLS.handleChunk](br, buf)) {
            break;
          }
        } while (true);
        this[SYMBOLS.reading] = false;
      }
      threw = false;
    } finally {
      if (threw) {
        this[SYMBOLS.close]();
      }
    }
  }

  [SYMBOLS.close]() {
    if (this[SYMBOLS.autoClose] && typeof this[SYMBOLS.fd] === 'number') {
      const fd = this[SYMBOLS.fd];
      this[SYMBOLS.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }
}

class WriteStream extends EventEmitter {
  constructor(path, opt = {}) {
    super(opt);
    this.readable = false;
    this.writable = true;
    this[SYMBOLS.errored] = false;
    this[SYMBOLS.writing] = false;
    this[SYMBOLS.ended] = false;
    this[SYMBOLS.needDrain] = false;
    this[SYMBOLS.queue] = [];
    this[SYMBOLS.path] = path;
    this[SYMBOLS.fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[SYMBOLS.mode] = opt.mode === undefined ? 0o666 : opt.mode;
    this[SYMBOLS.pos] = typeof opt.start === 'number' ? opt.start : null;
    this[SYMBOLS.autoClose] = typeof opt.autoClose === 'boolean' ? opt.autoClose : true;

    const defaultFlag = this[SYMBOLS.pos] !== null ? 'r+' : 'w';
    this[SYMBOLS.defaultFlag] = opt.flags === undefined;
    this[SYMBOLS.flags] = this[SYMBOLS.defaultFlag] ? defaultFlag : opt.flags;

    if (this[SYMBOLS.fd] === null) {
      this[SYMBOLS.open]();
    }
  }

  emit(ev, data) {
    if (ev === 'error') {
      if (this[SYMBOLS.errored]) {
        return;
      }
      this[SYMBOLS.errored] = true;
    }
    return super.emit(ev, data);
  }

  get fd() {
    return this[SYMBOLS.fd];
  }

  get path() {
    return this[SYMBOLS.path];
  }

  [SYMBOLS.onError](er) {
    this[SYMBOLS.close]();
    this[SYMBOLS.writing] = true;
    this.emit('error', er);
  }

  [SYMBOLS.open]() {
    fs.open(this[SYMBOLS.path], this[SYMBOLS.flags], this[SYMBOLS.mode], (er, fd) =>
      this[SYMBOLS.onOpen](er, fd)
    );
  }

  [SYMBOLS.onOpen](er, fd) {
    if (this[SYMBOLS.defaultFlag] && this[SYMBOLS.flags] === 'r+' && er && er.code === 'ENOENT') {
      this[SYMBOLS.flags] = 'w';
      this[SYMBOLS.open]();
    } else if (er) {
      this[SYMBOLS.onError](er);
    } else {
      this[SYMBOLS.fd] = fd;
      this.emit('open', fd);
      if (!this[SYMBOLS.writing]) {
        this[SYMBOLS.flush]();
      }
    }
  }

  end(buf, enc) {
    if (buf) {
      this.write(buf, enc);
    }

    this[SYMBOLS.ended] = true;

    if (!this[SYMBOLS.writing] && !this[SYMBOLS.queue].length && typeof this[SYMBOLS.fd] === 'number') {
      this[SYMBOLS.onWrite](null, 0);
    }
    return this;
  }

  write(buf, enc) {
    if (typeof buf === 'string') {
      buf = Buffer.from(buf, enc);
    }

    if (this[SYMBOLS.ended]) {
      this.emit('error', new Error('write() after end()'));
      return false;
    }

    if (this[SYMBOLS.fd] === null || this[SYMBOLS.writing] || this[SYMBOLS.queue].length) {
      this[SYMBOLS.queue].push(buf);
      this[SYMBOLS.needDrain] = true;
      return false;
    }

    this[SYMBOLS.writing] = true;
    this[SYMBOLS.write](buf);
    return true;
  }

  [SYMBOLS.write](buf) {
    fs.write(this[SYMBOLS.fd], buf, 0, buf.length, this[SYMBOLS.pos], (er, bw) =>
      this[SYMBOLS.onWrite](er, bw)
    );
  }

  [SYMBOLS.onWrite](er, bw) {
    if (er) {
      this[SYMBOLS.onError](er);
    } else {
      if (this[SYMBOLS.pos] !== null) {
        this[SYMBOLS.pos] += bw;
      }
      if (this[SYMBOLS.queue].length) {
        this[SYMBOLS.flush]();
      } else {
        this[SYMBOLS.writing] = false;

        if (this[SYMBOLS.ended] && !this[SYMBOLS.finished]) {
          this[SYMBOLS.finished] = true;
          this[SYMBOLS.close]();
          this.emit('finish');
        } else if (this[SYMBOLS.needDrain]) {
          this[SYMBOLS.needDrain] = false;
          this.emit('drain');
        }
      }
    }
  }

  [SYMBOLS.flush]() {
    if (this[SYMBOLS.queue].length === 0) {
      if (this[SYMBOLS.ended]) {
        this[SYMBOLS.onWrite](null, 0);
      }
    } else if (this[SYMBOLS.queue].length === 1) {
      this[SYMBOLS.write](this[SYMBOLS.queue].pop());
    } else {
      const iovec = this[SYMBOLS.queue];
      this[SYMBOLS.queue] = [];
      writev(this[SYMBOLS.fd], iovec, this[SYMBOLS.pos], (er, bw) => this[SYMBOLS.onWrite](er, bw));
    }
  }

  [SYMBOLS.close]() {
    if (this[SYMBOLS.autoClose] && typeof this[SYMBOLS.fd] === 'number') {
      const fd = this[SYMBOLS.fd];
      this[SYMBOLS.fd] = null;
      fs.close(fd, (er) => (er ? this.emit('error', er) : this.emit('close')));
    }
  }
}

class WriteStreamSync extends WriteStream {
  [SYMBOLS.open]() {
    let fd;
    if (this[SYMBOLS.defaultFlag] && this[SYMBOLS.flags] === 'r+') {
      try {
        fd = fs.openSync(this[SYMBOLS.path], this[SYMBOLS.flags], this[SYMBOLS.mode]);
      } catch (er) {
        if (er.code === 'ENOENT') {
          this[SYMBOLS.flags] = 'w';
          return this[SYMBOLS.open]();
        } else {
          throw er;
        }
      }
    } else {
      fd = fs.openSync(this[SYMBOLS.path], this[SYMBOLS.flags], this[SYMBOLS.mode]);
    }

    this[SYMBOLS.onOpen](null, fd);
  }

  [SYMBOLS.close]() {
    if (this[SYMBOLS.autoClose] && typeof this[SYMBOLS.fd] === 'number') {
      const fd = this[SYMBOLS.fd];
      this[SYMBOLS.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }

  [SYMBOLS.write](buf) {
    let threw = true;
    try {
      this[SYMBOLS.onWrite](null, fs.writeSync(this[SYMBOLS.fd], buf, 0, buf.length, this[SYMBOLS.pos]));
      threw = false;
    } finally {
      if (threw) {
        try {
          this[SYMBOLS.close]();
        } catch {
          // Handle error silently
        }
      }
    }
  }
}

exports.ReadStream = ReadStream;
exports.ReadStreamSync = ReadStreamSync;
exports.WriteStream = WriteStream;
exports.WriteStreamSync = WriteStreamSync;
