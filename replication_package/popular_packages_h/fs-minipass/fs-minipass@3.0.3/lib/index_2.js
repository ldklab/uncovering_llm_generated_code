'use strict';
const { Minipass } = require('minipass');
const EE = require('events').EventEmitter;
const fs = require('fs');

const _symbols = {
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
  errored: Symbol('_errored')
};

class BaseReadStream extends Minipass {
  constructor(path, opt = {}) {
    super(opt);
    if (typeof path !== 'string') throw new TypeError('path must be a string');

    Object.assign(this, {
      [_symbols.fd]: typeof opt.fd === 'number' ? opt.fd : null,
      [_symbols.path]: path,
      [_symbols.readSize]: opt.readSize || 16 * 1024 * 1024,
      [_symbols.size]: typeof opt.size === 'number' ? opt.size : Infinity,
      [_symbols.remain]: this[_symbols.size],
      [_symbols.autoClose]: opt.autoClose !== false,
      [_symbols.errored]: false,
      readable: true,
      writable: false,
      [_symbols.reading]: false
    });

    this[_symbols.fd] ? this[_symbols.read]() : this[_symbols.open]();
  }

  get fd() { return this[_symbols.fd]; }
  get path() { return this[_symbols.path]; }

  write() { throw new TypeError('this is a readable stream'); }
  end() { throw new TypeError('this is a readable stream'); }

  [_symbols.open]() {
    fs.open(this[_symbols.path], 'r', (er, fd) => this[_symbols.onopen](er, fd));
  }

  [_symbols.onopen](er, fd) {
    if (er) return this[_symbols.onerror](er);
    this[_symbols.fd] = fd;
    this.emit('open', fd);
    this[_symbols.read]();
  }

  [_symbols.makeBuf]() {
    return Buffer.allocUnsafe(Math.min(this[_symbols.readSize], this[_symbols.remain]));
  }

  [_symbols.read]() {
    if (this[_symbols.reading]) return;
    this[_symbols.reading] = true;

    const buf = this[_symbols.makeBuf]();
    if (buf.length === 0) return process.nextTick(() => this[_symbols.onread](null, 0, buf));

    fs.read(this[_symbols.fd], buf, 0, buf.length, null, (er, br, b) => this[_symbols.onread](er, br, b));
  }

  [_symbols.onread](er, br, buf) {
    this[_symbols.reading] = false;
    if (er) return this[_symbols.onerror](er);
    if (this[_symbols.handleChunk](br, buf)) this[_symbols.read]();
  }

  [_symbols.close]() {
    if (this[_symbols.autoClose] && typeof this[_symbols.fd] === 'number') {
      const fd = this[_symbols.fd];
      this[_symbols.fd] = null;
      fs.close(fd, er => er ? this.emit('error', er) : this.emit('close'));
    }
  }

  [_symbols.onerror](er) {
    this[_symbols.reading] = true;
    this[_symbols.close]();
    this.emit('error', er);
  }

  [_symbols.handleChunk](br, buf) {
    let ret = false;
    this[_symbols.remain] -= br;
    if (br > 0) ret = super.write(br < buf.length ? buf.slice(0, br) : buf);
    if (br === 0 || this[_symbols.remain] <= 0) {
      ret = false;
      this[_symbols.close](); super.end();
    }
    return ret;
  }

  emit(ev, data) {
    switch (ev) {
      case 'prefinish':
      case 'finish':
        return;
      case 'drain':
        if (typeof this[_symbols.fd] === 'number') this[_symbols.read]();
        return;
      case 'error':
        if (this[_symbols.errored]) return;
        this[_symbols.errored] = true;
    }
    return super.emit(ev, data);
  }
}

class ReadStreamSync extends BaseReadStream {
  [_symbols.open]() {
    let threw = true;
    try {
      this[_symbols.onopen](null, fs.openSync(this[_symbols.path], 'r'));
      threw = false;
    } finally {
      if (threw) this[_symbols.close]();
    }
  }

  [_symbols.read]() {
    let threw = true;
    try {
      if (!this[_symbols.reading]) {
        this[_symbols.reading] = true;
        do {
          const buf = this[_symbols.makeBuf]();
          const br = buf.length === 0 ? 0 : fs.readSync(this[_symbols.fd], buf, 0, buf.length, null);
          if (!this[_symbols.handleChunk](br, buf)) break;
        } while (true);
        this[_symbols.reading] = false;
      }
      threw = false;
    } finally {
      if (threw) this[_symbols.close]();
    }
  }

  [_symbols.close]() {
    if (this[_symbols.autoClose] && typeof this[_symbols.fd] === 'number') {
      const fd = this[_symbols.fd];
      this[_symbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }
}

class BaseWriteStream extends EE {
  constructor(path, opt = {}) {
    super(opt);
    Object.assign(this, {
      [_symbols.path]: path,
      [_symbols.fd]: typeof opt.fd === 'number' ? opt.fd : null,
      [_symbols.mode]: opt.mode === undefined ? 0o666 : opt.mode,
      [_symbols.pos]: typeof opt.start === 'number' ? opt.start : null,
      [_symbols.autoClose]: opt.autoClose !== false,
      [_symbols.errored]: false,
      [_symbols.writing]: false,
      [_symbols.ended]: false,
      [_symbols.needDrain]: false,
      [_symbols.queue]: [],
      readable: false,
      writable: true
    });

    const defaultFlag = this[_symbols.pos] !== null ? 'r+' : 'w';
    this[_symbols.defaultFlag] = opt.flags === undefined;
    this[_symbols.flags] = this[_symbols.defaultFlag] ? defaultFlag : opt.flags;

    if (this[_symbols.fd] === null) this[_symbols.open]();
  }

  emit(ev, data) {
    if (ev === 'error' && this[_symbols.errored]) return;
    if (ev === 'error') this[_symbols.errored] = true;
    return super.emit(ev, data);
  }

  get fd() { return this[_symbols.fd]; }
  get path() { return this[_symbols.path]; }

  [_symbols.onerror](er) {
    this[_symbols.close]();
    this[_symbols.writing] = true;
    this.emit('error', er);
  }

  [_symbols.open]() {
    fs.open(this[_symbols.path], this[_symbols.flags], this[_symbols.mode], (er, fd) => this[_symbols.onopen](er, fd));
  }

  [_symbols.onopen](er, fd) {
    if (this[_symbols.defaultFlag] && this[_symbols.flags] === 'r+' && er && er.code === 'ENOENT') {
      this[_symbols.flags] = 'w';
      this[_symbols.open]();
    } else if (er) {
      this[_symbols.onerror](er);
    } else {
      this[_symbols.fd] = fd;
      this.emit('open', fd);
      if (!this[_symbols.writing]) this[_symbols.flush]();
    }
  }

  end(buf, enc) {
    if (buf) this.write(buf, enc);
    this[_symbols.ended] = true;
    if (!this[_symbols.writing] && !this[_symbols.queue].length && typeof this[_symbols.fd] === 'number') {
      this[_symbols.onwrite](null, 0);
    }
    return this;
  }

  write(buf, enc) {
    if (typeof buf === 'string') buf = Buffer.from(buf, enc);
    if (this[_symbols.ended]) {
      this.emit('error', new Error('write() after end()'));
      return false;
    }

    if (this[_symbols.fd] === null || this[_symbols.writing] || this[_symbols.queue].length) {
      this[_symbols.queue].push(buf);
      this[_symbols.needDrain] = true;
      return false;
    }

    this[_symbols.writing] = true;
    this[_symbols.write](buf);
    return true;
  }

  [_symbols.write](buf) {
    fs.write(this[_symbols.fd], buf, 0, buf.length, this[_symbols.pos], (er, bw) => this[_symbols.onwrite](er, bw));
  }

  [_symbols.onwrite](er, bw) {
    if (er) return this[_symbols.onerror](er);
    if (this[_symbols.pos] !== null) this[_symbols.pos] += bw;
    if (this[_symbols.queue].length) {
      this[_symbols.flush]();
    } else {
      this[_symbols.writing] = false;
      if (this[_symbols.ended] && !this[_symbols.finished]) {
        this[_symbols.finished] = true;
        this[_symbols.close]();
        this.emit('finish');
      } else if (this[_symbols.needDrain]) {
        this[_symbols.needDrain] = false;
        this.emit('drain');
      }
    }
  }

  [_symbols.flush]() {
    if (this[_symbols.queue].length === 0) {
      if (this[_symbols.ended]) this[_symbols.onwrite](null, 0);
    } else if (this[_symbols.queue].length === 1) {
      this[_symbols.write](this[_symbols.queue].pop());
    } else {
      const iovec = this[_symbols.queue];
      this[_symbols.queue] = [];
      fs.writev(this[_symbols.fd], iovec, this[_symbols.pos], (er, bw) => this[_symbols.onwrite](er, bw));
    }
  }

  [_symbols.close]() {
    if (this[_symbols.autoClose] && typeof this[_symbols.fd] === 'number') {
      const fd = this[_symbols.fd];
      this[_symbols.fd] = null;
      fs.close(fd, er => er ? this.emit('error', er) : this.emit('close'));
    }
  }
}

class WriteStreamSync extends BaseWriteStream {
  [_symbols.open]() {
    let fd;
    if (this[_symbols.defaultFlag] && this[_symbols.flags] === 'r+') {
      try {
        fd = fs.openSync(this[_symbols.path], this[_symbols.flags], this[_symbols.mode]);
      } catch (er) {
        if (er.code === 'ENOENT') {
          this[_symbols.flags] = 'w';
          return this[_symbols.open]();
        } else {
          throw er;
        }
      }
    } else {
      fd = fs.openSync(this[_symbols.path], this[_symbols.flags], this[_symbols.mode]);
    }
    this[_symbols.onopen](null, fd);
  }

  [_symbols.close]() {
    if (this[_symbols.autoClose] && typeof this[_symbols.fd] === 'number') {
      const fd = this[_symbols.fd];
      this[_symbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }

  [_symbols.write](buf) {
    let threw = true;
    try {
      this[_symbols.onwrite](null, fs.writeSync(this[_symbols.fd], buf, 0, buf.length, this[_symbols.pos]));
      threw = false;
    } finally {
      if (threw) {
        try {
          this[_symbols.close]();
        } catch {
          // ignore closing error
        }
      }
    }
  }
}

exports.ReadStream = BaseReadStream;
exports.ReadStreamSync = ReadStreamSync;
exports.WriteStream = BaseWriteStream;
exports.WriteStreamSync = WriteStreamSync;
