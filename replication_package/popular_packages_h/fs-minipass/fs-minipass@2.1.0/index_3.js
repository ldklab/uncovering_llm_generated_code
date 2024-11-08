'use strict';
const MiniPass = require('minipass');
const EE = require('events').EventEmitter;
const fs = require('fs');

let writev = fs.writev;
if (!writev) {
  const binding = process.binding('fs');
  const FSReqWrap = binding.FSReqWrap || binding.FSReqCallback;

  writev = (fd, iovec, pos, cb) => {
    const done = (er, bw) => cb(er, bw, iovec);
    const req = new FSReqWrap();
    req.oncomplete = done;
    binding.writeBuffers(fd, iovec, pos, req);
  };
}

const symbols = {
  autoClose: Symbol('autoClose'),
  close: Symbol('close'),
  ended: Symbol('ended'),
  fd: Symbol('fd'),
  finished: Symbol('finished'),
  flags: Symbol('flags'),
  flush: Symbol('flush'),
  handleChunk: Symbol('handleChunk'),
  makeBuf: Symbol('makeBuf'),
  mode: Symbol('mode'),
  needDrain: Symbol('needDrain'),
  onerror: Symbol('onerror'),
  onopen: Symbol('onopen'),
  onread: Symbol('onread'),
  onwrite: Symbol('onwrite'),
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
  defaultFlag: Symbol('defaultFlag'),
  errored: Symbol('errored')
};

class ReadStream extends MiniPass {
  constructor(path, opt = {}) {
    super(opt);
    this.readable = true;
    this.writable = false;

    if (typeof path !== 'string') throw new TypeError('path must be a string');

    this[symbols.errored] = false;
    this[symbols.fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[symbols.path] = path;
    this[symbols.readSize] = opt.readSize || 16 * 1024 * 1024;
    this[symbols.reading] = false;
    this[symbols.size] = typeof opt.size === 'number' ? opt.size : Infinity;
    this[symbols.remain] = this[symbols.size];
    this[symbols.autoClose] = typeof opt.autoClose === 'boolean' ? opt.autoClose : true;

    this[symbols.fd] !== null ? this[symbols.read]() : this[symbols.open]();
  }

  get fd() { return this[symbols.fd]; }
  get path() { return this[symbols.path]; }

  write() { throw new TypeError('this is a readable stream'); }
  end() { throw new TypeError('this is a readable stream'); }

  [symbols.open]() {
    fs.open(this[symbols.path], 'r', (er, fd) => this[symbols.onopen](er, fd));
  }

  [symbols.onopen](er, fd) {
    if (er) this[symbols.onerror](er);
    else {
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
      if (buf.length === 0) return process.nextTick(() => this[symbols.onread](null, 0, buf));
      fs.read(this[symbols.fd], buf, 0, buf.length, null, (er, br, buf) => this[symbols.onread](er, br, buf));
    }
  }

  [symbols.onread](er, br, buf) {
    this[symbols.reading] = false;
    if (er) this[symbols.onerror](er);
    else if (this[symbols.handleChunk](br, buf)) this[symbols.read]();
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      fs.close(fd, er => er ? this.emit('error', er) : this.emit('close'));
    }
  }

  [symbols.onerror](er) {
    this[symbols.reading] = true;
    this[symbols.close]();
    this.emit('error', er);
  }

  [symbols.handleChunk](br, buf) {
    let ret = false;
    this[symbols.remain] -= br;
    if (br > 0) ret = super.write(br < buf.length ? buf.slice(0, br) : buf);

    if (br === 0 || this[symbols.remain] <= 0) {
      ret = false;
      this[symbols.close]();
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
        if (typeof this[symbols.fd] === 'number') this[symbols.read]();
        break;
      case 'error':
        if (!this[symbols.errored]) {
          this[symbols.errored] = true;
          return super.emit(ev, data);
        }
        break;
      default:
        return super.emit(ev, data);
    }
  }
}

class ReadStreamSync extends ReadStream {
  [symbols.open]() {
    let threw = true;
    try {
      this[symbols.onopen](null, fs.openSync(this[symbols.path], 'r'));
      threw = false;
    } finally {
      if (threw) this[symbols.close]();
    }
  }

  [symbols.read]() {
    let threw = true;
    try {
      if (!this[symbols.reading]) {
        this[symbols.reading] = true;
        do {
          const buf = this[symbols.makeBuf]();
          const br = buf.length === 0 ? 0 : fs.readSync(this[symbols.fd], buf, 0, buf.length, null);
          if (!this[symbols.handleChunk](br, buf)) break;
        } while (true);
        this[symbols.reading] = false;
      }
      threw = false;
    } finally {
      if (threw) this[symbols.close]();
    }
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }
}

class WriteStream extends EE {
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
    this[symbols.mode] = opt.mode === undefined ? 0o666 : opt.mode;
    this[symbols.pos] = typeof opt.start === 'number' ? opt.start : null;
    this[symbols.autoClose] = typeof opt.autoClose === 'boolean' ? opt.autoClose : true;
    const defaultFlag = this[symbols.pos] !== null ? 'r+' : 'w';
    this[symbols.defaultFlag] = opt.flags === undefined;
    this[symbols.flags] = this[symbols.defaultFlag] ? defaultFlag : opt.flags;

    if (this[symbols.fd] === null) this[symbols.open]();
  }

  emit(ev, data) {
    if (ev === 'error' && this[symbols.errored]) return;
    if (ev === 'error') this[symbols.errored] = true;
    return super.emit(ev, data);
  }

  get fd() { return this[symbols.fd]; }
  get path() { return this[symbols.path]; }

  [symbols.onerror](er) {
    this[symbols.close]();
    this[symbols.writing] = true;
    this.emit('error', er);
  }

  [symbols.open]() {
    fs.open(this[symbols.path], this[symbols.flags], this[symbols.mode],
      (er, fd) => this[symbols.onopen](er, fd));
  }

  [symbols.onopen](er, fd) {
    if (this[symbols.defaultFlag] && this[symbols.flags] === 'r+' && er && er.code === 'ENOENT') {
      this[symbols.flags] = 'w';
      this[symbols.open]();
    } else if (er) this[symbols.onerror](er);
    else {
      this[symbols.fd] = fd;
      this.emit('open', fd);
      this[symbols.flush]();
    }
  }

  end(buf, enc) {
    if (buf) this.write(buf, enc);
    this[symbols.ended] = true;
    if (!this[symbols.writing] && !this[symbols.queue].length && typeof this[symbols.fd] === 'number') 
      this[symbols.onwrite](null, 0);
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
    fs.write(this[symbols.fd], buf, 0, buf.length, this[symbols.pos], (er, bw) => this[symbols.onwrite](er, bw));
  }

  [symbols.onwrite](er, bw) {
    if (er) this[symbols.onerror](er);
    else {
      if (this[symbols.pos] !== null) this[symbols.pos] += bw;
      if (this[symbols.queue].length) this[symbols.flush]();
      else {
        this[symbols.writing] = false;

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
  }

  [symbols.flush]() {
    if (this[symbols.queue].length === 0) {
      if (this[symbols.ended]) this[symbols.onwrite](null, 0);
    } else if (this[symbols.queue].length === 1) this[symbols.write](this[symbols.queue].pop());
    else {
      const iovec = this[symbols.queue];
      this[symbols.queue] = [];
      writev(this[symbols.fd], iovec, this[symbols.pos], (er, bw) => this[symbols.onwrite](er, bw));
    }
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      fs.close(fd, er => er ? this.emit('error', er) : this.emit('close'));
    }
  }
}

class WriteStreamSync extends WriteStream {
  [symbols.open]() {
    let fd;
    if (this[symbols.defaultFlag] && this[symbols.flags] === 'r+') {
      try {
        fd = fs.openSync(this[symbols.path], this[symbols.flags], this[symbols.mode]);
      } catch (er) {
        if (er.code === 'ENOENT') {
          this[symbols.flags] = 'w';
          return this[symbols.open]();
        } else throw er;
      }
    } else fd = fs.openSync(this[symbols.path], this[symbols.flags], this[symbols.mode]);

    this[symbols.onopen](null, fd);
  }

  [symbols.close]() {
    if (this[symbols.autoClose] && typeof this[symbols.fd] === 'number') {
      const fd = this[symbols.fd];
      this[symbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }

  [symbols.write](buf) {
    let threw = true;
    try {
      this[symbols.onwrite](null, fs.writeSync(this[symbols.fd], buf, 0, buf.length, this[symbols.pos]));
      threw = false;
    } finally {
      if (threw) try { this[symbols.close](); } catch (_) {}
    }
  }
}

exports.ReadStream = ReadStream;
exports.ReadStreamSync = ReadStreamSync;
exports.WriteStream = WriteStream;
exports.WriteStreamSync = WriteStreamSync;
