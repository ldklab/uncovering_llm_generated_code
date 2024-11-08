'use strict';
const { Minipass } = require('minipass');
const { EventEmitter } = require('events');
const fs = require('fs');

const writev = fs.writev;
const close = fs.close;
const closeSync = fs.closeSync;
const open = fs.open;
const openSync = fs.openSync;
const read = fs.read;
const readSync = fs.readSync;
const write = fs.write;
const writeSync = fs.writeSync;

const symbols = {
  autoClose: Symbol('_autoClose'),
  close: Symbol('_close'),
  ended: Symbol('_ended'),
  fd: Symbol('_fd'),
  finished: Symbol('_finished'),
  flags: Symbol('_flags'),
  flush: Symbol('_flush'),
  handleChunk: Symbol('_handleChunk'),
  makeBuf: Symbol('_makeBuf'),
  mode: Symbol('_mode'),
  needDrain: Symbol('_needDrain'),
  onerror: Symbol('_onerror'),
  onopen: Symbol('_onopen'),
  onread: Symbol('_onread'),
  onwrite: Symbol('_onwrite'),
  open: Symbol('_open'),
  path: Symbol('_path'),
  pos: Symbol('_pos'),
  queue: Symbol('_queue'),
  read: Symbol('_read'),
  readSize: Symbol('_readSize'),
  reading: Symbol('_reading'),
  remain: Symbol('_remain'),
  size: Symbol('_size'),
  write: Symbol('_write'),
  writing: Symbol('_writing'),
  defaultFlag: Symbol('_defaultFlag'),
  errored: Symbol('_errored'),
};

class ReadStream extends Minipass {
  constructor(path, opt = {}) {
    super(opt);
    if (typeof path !== 'string') throw new TypeError('path must be a string');

    this.readable = true;
    this.writable = false;
    this[symbols.errored] = false;
    this[symbols.fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[symbols.path] = path;
    this[symbols.readSize] = opt.readSize || 16 * 1024 * 1024;
    this[symbols.reading] = false;
    this[symbols.size] = typeof opt.size === 'number' ? opt.size : Infinity;
    this[symbols.remain] = this[symbols.size];
    this[symbols.autoClose] = opt.autoClose ?? true;

    typeof this[symbols.fd] === 'number' ? this[symbols.read]() : this[symbols.open]();
  }

  get fd() {
    return this[symbols.fd];
  }

  get path() {
    return this[symbols.path];
  }

  write() {
    throw new TypeError('this is a readable stream');
  }

  end() {
    throw new TypeError('this is a readable stream');
  }

  [symbols.open]() {
    open(this[symbols.path], 'r', (er, fd) => this[symbols.onopen](er, fd));
  }

  [symbols.onopen](er, fd) {
    if (er) {
      this[symbols.onerror](er);
    } else {
      this[symbols.fd] = fd;
      this.emit('open', fd);
      this[symbols.read]();
    }
  }

  [symbols.makeBuf]() {
    return Buffer.allocUnsafe(Math.min(this[symbols.readSize], this[symbols.remain]));
  }

  [symbols.read]() {
    if (!this[symbols.reading]) {
      this[symbols.reading] = true;
      const buf = this[symbols.makeBuf]();
      if (buf.length === 0) {
        return process.nextTick(() => this[symbols.onread](null, 0, buf));
      }
      read(this[symbols.fd], buf, 0, buf.length, null, (er, br, b) => this[symbols.onread](er, br, b));
    }
  }

  [symbols.onread](er, br, buf) {
    this[symbols.reading] = false;
    er ? this[symbols.onerror](er) : this[symbols.handleChunk](br, buf) && this[symbols.read]();
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      close(fd, (er) => (er ? this.emit('error', er) : this.emit('close')));
    }
  }

  [symbols.onerror](er) {
    this[symbols.reading] = true;
    this[symbols.close]();
    this.emit('error', er);
  }

  [symbols.handleChunk](br, buf) {
    this[symbols.remain] -= br;
    if (br > 0) {
      super.write(br < buf.length ? buf.slice(0, br) : buf);
    }
    if (br === 0 || this[symbols.remain] <= 0) {
      this[symbols.close]();
      super.end();
    }
    return br > 0;
  }

  emit(ev, data) {
    if (ev === 'error' && this[symbols.errored]) return;
    this[symbols.errored] = true;
    super.emit(ev, data);
  }
}

class ReadStreamSync extends ReadStream {
  [symbols.open]() {
    let threw = true;
    try {
      this[symbols.onopen](null, openSync(this[symbols.path], 'r'));
      threw = false;
    } finally {
      if (threw) {
        this[symbols.close]();
      }
    }
  }

  [symbols.read]() {
    let threw = true;
    try {
      if (!this[symbols.reading]) {
        this[symbols.reading] = true;
        do {
          const buf = this[symbols.makeBuf]();
          const br = buf.length === 0 ? 0 : readSync(this[symbols.fd], buf, 0, buf.length, null);
          if (!this[symbols.handleChunk](br, buf)) break;
        } while (true);
        this[symbols.reading] = false;
      }
      threw = false;
    } finally {
      if (threw) {
        this[symbols.close]();
      }
    }
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      closeSync(fd);
      this.emit('close');
    }
  }
}

class WriteStream extends EventEmitter {
  constructor(path, opt = {}) {
    super(opt);
    this.readable = false;
    this.writable = true;
    this[symbols.errored] = false;
    this[symbols.writing] = false;
    this[symbols.ended] = false;
    this[symbols.needDrain] = false;
    this[symbols.queue] = [];
    this[symbols.path] = path;
    this[symbols.fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[symbols.mode] = opt.mode ?? 0o666;
    this[symbols.pos] = typeof opt.start === 'number' ? opt.start : null;
    this[symbols.autoClose] = opt.autoClose ?? true;

    const defaultFlag = this[symbols.pos] !== null ? 'r+' : 'w';
    this[symbols.defaultFlag] = opt.flags === undefined;
    this[symbols.flags] = this[symbols.defaultFlag] ? defaultFlag : opt.flags;

    if (this[symbols.fd] === null) {
      this[symbols.open]();
    }
  }

  emit(ev, data) {
    if (ev === 'error' && this[symbols.errored]) return;
    this[symbols.errored] = true;
    super.emit(ev, data);
  }

  get fd() {
    return this[symbols.fd];
  }

  get path() {
    return this[symbols.path];
  }

  [symbols.onerror](er) {
    this[symbols.close]();
    this[symbols.writing] = true;
    this.emit('error', er);
  }

  [symbols.open]() {
    open(this[symbols.path], this[symbols.flags], this[symbols.mode], (er, fd) => this[symbols.onopen](er, fd));
  }

  [symbols.onopen](er, fd) {
    if (this[symbols.defaultFlag] && this[symbols.flags] === 'r+' && er && er.code === 'ENOENT') {
      this[symbols.flags] = 'w';
      this[symbols.open]();
    } else if (er) {
      this[symbols.onerror](er);
    } else {
      this[symbols.fd] = fd;
      this.emit('open', fd);
      !this[symbols.writing] && this[symbols.flush]();
    }
  }

  end(buf, enc) {
    buf && this.write(buf, enc);
    this[symbols.ended] = true;
    !this[symbols.writing] && !this[symbols.queue].length && typeof this[symbols.fd] === 'number' && this[symbols.onwrite](null, 0);
    return this;
  }

  write(buf, enc) {
    if (typeof buf === 'string') buf = Buffer.from(buf, enc);
    if (this[symbols.ended]) {
      this.emit('error', new Error('write() after end()'));
      return false;
    }

    if (this[symbols.fd] === null || this[symbols.writing] || this[symbols.queue].length) {
      this[symbols.queue].push(buf);
      this[symbols.needDrain] = true;
      return false;
    }

    this[symbols.writing] = true;
    this[symbols.write](buf);
    return true;
  }

  [symbols.write](buf) {
    write(this[symbols.fd], buf, 0, buf.length, this[symbols.pos], (er, bw) => this[symbols.onwrite](er, bw));
  }

  [symbols.onwrite](er, bw) {
    if (er) {
      this[symbols.onerror](er);
    } else {
      this[symbols.pos] !== null && (this[symbols.pos] += bw);
      this[symbols.queue].length ? this[symbols.flush]() : (this[symbols.writing] = false);

      if (this[symbols.ended] && !this[symbols.finished]) {
        this[symbols.finished] = true;
        this[symbols.close]();
        this.emit('finish');
      } else if (this[symbols.needDrain]) {
        this[symbols.needDrain] = false;
        this.emit('drain');
      }
    }
  }

  [symbols.flush]() {
    if (this[symbols.queue].length === 0) {
      this[symbols.ended] && this[symbols.onwrite](null, 0);
    } else if (this[symbols.queue].length === 1) {
      this[symbols.write](this[symbols.queue].pop());
    } else {
      const iovec = this[symbols.queue];
      this[symbols.queue] = [];
      writev(this[symbols.fd], iovec, this[symbols.pos], (er, bw) => this[symbols.onwrite](er, bw));
    }
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      close(fd, (er) => (er ? this.emit('error', er) : this.emit('close')));
    }
  }
}

class WriteStreamSync extends WriteStream {
  [symbols.open]() {
    let fd;
    if (this[symbols.defaultFlag] && this[symbols.flags] === 'r+') {
      try {
        fd = openSync(this[symbols.path], this[symbols.flags], this[symbols.mode]);
      } catch (er) {
        if (er.code === 'ENOENT') {
          this[symbols.flags] = 'w';
          return this[symbols.open]();
        } else {
          throw er;
        }
      }
    } else {
      fd = openSync(this[symbols.path], this[symbols.flags], this[symbols.mode]);
    }
    this[symbols.onopen](null, fd);
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      closeSync(fd);
      this.emit('close');
    }
  }

  [symbols.write](buf) {
    let threw = true;
    try {
      this[symbols.onwrite](null, writeSync(this[symbols.fd], buf, 0, buf.length, this[symbols.pos]));
      threw = false;
    } finally {
      if (threw) {
        try {
          this[symbols.close]();
        } catch {
          // quietly fail
        }
      }
    }
  }
}

module.exports = {
  ReadStream,
  ReadStreamSync,
  WriteStream,
  WriteStreamSync,
};
