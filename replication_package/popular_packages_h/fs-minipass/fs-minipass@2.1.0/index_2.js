'use strict';
const { EventEmitter } = require('events');
const fs = require('fs');
const MiniPass = require('minipass');
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

const privateSymbols = {
  fd: Symbol('fd'),
  path: Symbol('path'),
  readSize: Symbol('readSize'),
  reading: Symbol('reading'),
  remain: Symbol('remain'),
  autoClose: Symbol('autoClose'),
  errored: Symbol('errored'),
  open: Symbol('open'),
  onOpen: Symbol('onOpen'),
  onRead: Symbol('onRead'),
  read: Symbol('read'),
  makeBuf: Symbol('makeBuf'),
  handleChunk: Symbol('handleChunk'),
  onError: Symbol('onError'),
  close: Symbol('close'),
  ended: Symbol('ended'),
  needDrain: Symbol('needDrain'),
  writing: Symbol('writing'),
  flags: Symbol('flags'),
  pos: Symbol('pos'),
  queue: Symbol('queue'),
  flush: Symbol('flush'),
  write: Symbol('write'),
  onWrite: Symbol('onWrite'),
};

class ReadStream extends MiniPass {
  constructor(path, options = {}) {
    super(options);
    this.readable = true;
    this.writable = false;

    if (typeof path !== 'string') throw new TypeError('path must be a string');

    this[privateSymbols.fd] = typeof options.fd === 'number' ? options.fd : null;
    this[privateSymbols.path] = path;
    this[privateSymbols.readSize] = options.readSize || 16 * 1024 * 1024;
    this[privateSymbols.reading] = false;
    this[privateSymbols.remain] = typeof options.size === 'number' ? options.size : Infinity;
    this[privateSymbols.autoClose] = typeof options.autoClose === 'boolean' ? options.autoClose : true;
    this[privateSymbols.errored] = false;

    if (typeof this[privateSymbols.fd] === 'number') {
      this._read();
    } else {
      this._open();
    }
  }

  get fd() {
    return this[privateSymbols.fd];
  }

  get path() {
    return this[privateSymbols.path];
  }

  write() {
    throw new TypeError('this is a readable stream');
  }

  end() {
    throw new TypeError('this is a readable stream');
  }

  _open() {
    fs.open(this[privateSymbols.path], 'r', (err, fd) => this._onOpen(err, fd));
  }

  _onOpen(err, fd) {
    if (err) {
      this._onError(err);
    } else {
      this[privateSymbols.fd] = fd;
      this.emit('open', fd);
      this._read();
    }
  }

  _makeBuf() {
    return Buffer.allocUnsafe(Math.min(this[privateSymbols.readSize], this[privateSymbols.remain]));
  }

  _read() {
    if (!this[privateSymbols.reading]) {
      this[privateSymbols.reading] = true;
      const buf = this._makeBuf();
      if (buf.length === 0) {
        return process.nextTick(() => this._onRead(null, 0, buf));
      }
      fs.read(this[privateSymbols.fd], buf, 0, buf.length, null, (err, bytesRead, buffer) =>
        this._onRead(err, bytesRead, buffer)
      );
    }
  }

  _onRead(err, bytesRead, buf) {
    this[privateSymbols.reading] = false;
    if (err) {
      this._onError(err);
    } else if (this._handleChunk(bytesRead, buf)) {
      this._read();
    }
  }

  _handleChunk(bytesRead, buf) {
    let ret = false;
    this[privateSymbols.remain] -= bytesRead;
    if (bytesRead > 0) {
      ret = super.write(bytesRead < buf.length ? buf.slice(0, bytesRead) : buf);
    }

    if (bytesRead === 0 || this[privateSymbols.remain] <= 0) {
      ret = false;
      this._close();
      super.end();
    }
    return ret;
  }

  _onError(err) {
    this[privateSymbols.reading] = true;
    this._close();
    this.emit('error', err);
  }

  _close() {
    if (this[privateSymbols.autoClose] && typeof this[privateSymbols.fd] === 'number') {
      const fd = this[privateSymbols.fd];
      this[privateSymbols.fd] = null;
      fs.close(fd, (err) => (err ? this.emit('error', err) : this.emit('close')));
    }
  }

  emit(event, data) {
    switch (event) {
      case 'drain':
        if (typeof this[privateSymbols.fd] === 'number') this._read();
        break;
      case 'error':
        if (this[privateSymbols.errored]) return;
        this[privateSymbols.errored] = true;
        return super.emit(event, data);
      default:
        return super.emit(event, data);
    }
  }
}

class ReadStreamSync extends ReadStream {
  _open() {
    let threw = true;
    try {
      this._onOpen(null, fs.openSync(this[privateSymbols.path], 'r'));
      threw = false;
    } finally {
      if (threw) this._close();
    }
  }

  _read() {
    let threw = true;
    try {
      if (!this[privateSymbols.reading]) {
        this[privateSymbols.reading] = true;
        do {
          const buf = this._makeBuf();
          const bytesRead = buf.length === 0 ? 0 : fs.readSync(this[privateSymbols.fd], buf, 0, buf.length, null);
          if (!this._handleChunk(bytesRead, buf)) break;
        } while (true);
        this[privateSymbols.reading] = false;
      }
      threw = false;
    } finally {
      if (threw) this._close();
    }
  }

  _close() {
    if (this[privateSymbols.autoClose] && typeof this[privateSymbols.fd] === 'number') {
      const fd = this[privateSymbols.fd];
      this[privateSymbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }
}

class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super(options);
    this.readable = false;
    this.writable = true;

    this[privateSymbols.errored] = false;
    this[privateSymbols.writing] = false;
    this[privateSymbols.ended] = false;
    this[privateSymbols.needDrain] = false;
    this[privateSymbols.queue] = [];
    this[privateSymbols.path] = path;
    this[privateSymbols.fd] = typeof options.fd === 'number' ? options.fd : null;
    this[privateSymbols.mode] = options.mode === undefined ? 0o666 : options.mode;
    this[privateSymbols.pos] = typeof options.start === 'number' ? options.start : null;
    this[privateSymbols.autoClose] = typeof options.autoClose === 'boolean' ? options.autoClose : true;

    const defaultFlag = this[privateSymbols.pos] !== null ? 'r+' : 'w';
    this[privateSymbols.flags] = options.flags !== undefined ? options.flags : defaultFlag;

    if (this[privateSymbols.fd] === null) this._open();
  }

  emit(event, data) {
    if (event === 'error') {
      if (this[privateSymbols.errored]) return;
      this[privateSymbols.errored] = true;
    }
    return super.emit(event, data);
  }

  get fd() {
    return this[privateSymbols.fd];
  }

  get path() {
    return this[privateSymbols.path];
  }

  _onError(err) {
    this._close();
    this[privateSymbols.writing] = true;
    this.emit('error', err);
  }

  _open() {
    fs.open(this[privateSymbols.path], this[privateSymbols.flags], this[privateSymbols.mode], (err, fd) => this._onOpen(err, fd));
  }

  _onOpen(err, fd) {
    if (err && this[privateSymbols.flags] === 'r+' && err.code === 'ENOENT') {
      this[privateSymbols.flags] = 'w';
      this._open();
    } else if (err) {
      this._onError(err);
    } else {
      this[privateSymbols.fd] = fd;
      this.emit('open', fd);
      this._flush();
    }
  }

  write(buf, enc) {
    if (typeof buf === 'string') buf = Buffer.from(buf, enc);

    if (this[privateSymbols.ended]) {
      this.emit('error', new Error('write() after end()'));
      return false;
    }

    if (this[privateSymbols.fd] === null || this[privateSymbols.writing] || this[privateSymbols.queue].length) {
      this[privateSymbols.queue].push(buf);
      this[privateSymbols.needDrain] = true;
      return false;
    }

    this[privateSymbols.writing] = true;
    this._write(buf);
    return true;
  }

  end(buf, enc) {
    if (buf) this.write(buf, enc);
    this[privateSymbols.ended] = true;

    if (!this[privateSymbols.writing] && !this[privateSymbols.queue].length && typeof this[privateSymbols.fd] === 'number') {
      this._onWrite(null, 0);
    }
    return this;
  }

  _write(buf) {
    fs.write(this[privateSymbols.fd], buf, 0, buf.length, this[privateSymbols.pos], (err, bytesWritten) => this._onWrite(err, bytesWritten));
  }

  _onWrite(err, bytesWritten) {
    if (err) {
      this._onError(err);
    } else {
      if (this[privateSymbols.pos] !== null) this[privateSymbols.pos] += bytesWritten;
      if (this[privateSymbols.queue].length) {
        this._flush();
      } else {
        this[privateSymbols.writing] = false;

        if (this[privateSymbols.ended] && !this[privateSymbols.finished]) {
          this[privateSymbols.finished] = true;
          this._close();
          this.emit('finish');
        } else if (this[privateSymbols.needDrain]) {
          this[privateSymbols.needDrain] = false;
          this.emit('drain');
        }
      }
    }
  }

  _flush() {
    if (this[privateSymbols.queue].length === 0) {
      if (this[privateSymbols.ended]) this._onWrite(null, 0);
    } else if (this[privateSymbols.queue].length === 1) {
      this._write(this[privateSymbols.queue].pop());
    } else {
      const iovec = this[privateSymbols.queue];
      this[privateSymbols.queue] = [];
      writev(this[privateSymbols.fd], iovec, this[privateSymbols.pos], (err, bytesWritten) => this._onWrite(err, bytesWritten));
    }
  }

  _close() {
    if (this[privateSymbols.autoClose] && typeof this[privateSymbols.fd] === 'number') {
      const fd = this[privateSymbols.fd];
      this[privateSymbols.fd] = null;
      fs.close(fd, (err) => (err ? this.emit('error', err) : this.emit('close')));
    }
  }
}

class WriteStreamSync extends WriteStream {
  _open() {
    let fd;
    if (this[privateSymbols.flags] === 'r+') {
      try {
        fd = fs.openSync(this[privateSymbols.path], this[privateSymbols.flags], this[privateSymbols.mode]);
      } catch (err) {
        if (err.code === 'ENOENT') {
          this[privateSymbols.flags] = 'w';
          return this._open();
        } else throw err;
      }
    } else {
      fd = fs.openSync(this[privateSymbols.path], this[privateSymbols.flags], this[privateSymbols.mode]);
    }

    this._onOpen(null, fd);
  }

  _close() {
    if (this[privateSymbols.autoClose] && typeof this[privateSymbols.fd] === 'number') {
      const fd = this[privateSymbols.fd];
      this[privateSymbols.fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }

  _write(buf) {
    let threw = true;
    try {
      this._onWrite(null, fs.writeSync(this[privateSymbols.fd], buf, 0, buf.length, this[privateSymbols.pos]));
      threw = false;
    } finally {
      if (threw) try { this._close(); } catch (_) {}
    }
  }
}

exports.ReadStream = ReadStream;
exports.ReadStreamSync = ReadStreamSync;
exports.WriteStream = WriteStream;
exports.WriteStreamSync = WriteStreamSync;
