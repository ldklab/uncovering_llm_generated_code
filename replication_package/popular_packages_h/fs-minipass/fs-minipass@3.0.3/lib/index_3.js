'use strict'
const { Minipass } = require('minipass');
const { EventEmitter } = require('events');
const fs = require('fs');

class ReadStream extends Minipass {
  constructor(path, opt = {}) {
    super(opt);
    if (typeof path !== 'string') throw new TypeError('path must be a string');
    
    // Initialize properties
    this.readable = true;
    this.writable = false;
    this[_initProperties](path, opt);
    
    // Open the file descriptor
    typeof this[_fd] === 'number' ? this[_read]() : this[_open]();
  }

  [_initProperties](path, opt) {
    this[_errored] = false;
    this[_fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[_path] = path;
    this[_readSize] = opt.readSize || 16 * 1024 * 1024;
    this[_reading] = false;
    this[_size] = typeof opt.size === 'number' ? opt.size : Infinity;
    this[_remain] = this[_size];
    this[_autoClose] = opt.autoClose !== false;
  }

  get fd() { return this[_fd]; }
  get path() { return this[_path]; }

  write() { throw new TypeError('this is a readable stream'); }
  end() { throw new TypeError('this is a readable stream'); }

  [_open]() {
    fs.open(this[_path], 'r', (err, fd) => this[_onopen](err, fd));
  }

  [_onopen](err, fd) {
    if (err) this[_onerror](err);
    else {
      this[_fd] = fd;
      this.emit('open', fd);
      this[_read]();
    }
  }

  [_makeBuf]() {
    return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]));
  }

  [_read]() {
    if (!this[_reading]) {
      this[_reading] = true;
      const buf = this[_makeBuf]();
      if (buf.length === 0) return process.nextTick(() => this[_onread](null, 0, buf));
      fs.read(this[_fd], buf, 0, buf.length, null, (err, bytesRead, buffer) => this[_onread](err, bytesRead, buffer));
    }
  }

  [_onread](err, bytesRead, buf) {
    this[_reading] = false;
    if (err) this[_onerror](err);
    else if (this[_handleChunk](bytesRead, buf)) this[_read]();
  }

  [_handleChunk](bytesRead, buf) {
    this[_remain] -= bytesRead;
    let shouldContinue = bytesRead > 0 && super.write(bytesRead < buf.length ? buf.slice(0, bytesRead) : buf);
    
    if (bytesRead === 0 || this[_remain] <= 0) {
      shouldContinue = false;
      this[_close]();
      super.end();
    }
    return shouldContinue;
  }

  [_close]() {
    if (this[_autoClose] && typeof this[_fd] === 'number') {
      const fd = this[_fd];
      this[_fd] = null;
      fs.close(fd, err => err ? this.emit('error', err) : this.emit('close'));
    }
  }

  [_onerror](err) {
    this[_reading] = true;
    this[_close]();
    this.emit('error', err);
  }

  emit(event, data) {
    if (['prefinish', 'finish'].includes(event)) return;
    if (event === 'drain' && typeof this[_fd] === 'number') this[_read]();
    if (event === 'error') {
      if (this[_errored]) return;
      this[_errored] = true;
    }
    return super.emit(event, data);
  }
}

class ReadStreamSync extends ReadStream {
  [_open]() {
    try {
      this[_onopen](null, fs.openSync(this[_path], 'r'));
    } catch (err) {
      this[_close]();
    }
  }

  [_read]() {
    try {
      if (!this[_reading]) {
        this[_reading] = true;
        do {
          const buf = this[_makeBuf]();
          const bytesRead = buf.length ? fs.readSync(this[_fd], buf, 0, buf.length, null) : 0;
          if (!this[_handleChunk](bytesRead, buf)) break;
        } while (true);
        this[_reading] = false;
      }
    } catch (err) {
      this[_close]();
    }
  }

  [_close]() {
    if (this[_autoClose] && typeof this[_fd] === 'number') {
      const fd = this[_fd];
      this[_fd] = null;
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
    this[_initProperties](path, opt);
    if (this[_fd] === null) this[_open]();
  }

  [_initProperties](path, opt) {
    this[_errored] = false;
    this[_writing] = false;
    this[_ended] = false;
    this[_needDrain] = false;
    this[_queue] = [];
    this[_path] = path;
    this[_fd] = typeof opt.fd === 'number' ? opt.fd : null;
    this[_mode] = opt.mode === undefined ? 0o666 : opt.mode;
    this[_pos] = typeof opt.start === 'number' ? opt.start : null;
    this[_autoClose] = opt.autoClose !== false;
    this[_setFlags](opt);
  }

  [_setFlags](opt) {
    const defaultFlag = this[_pos] !== null ? 'r+' : 'w';
    this[_defaultFlag] = opt.flags === undefined;
    this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags;
  }

  get fd() { return this[_fd]; }
  get path() { return this[_path]; }

  [_onerror](err) {
    this[_close]();
    this[_writing] = true;
    this.emit('error', err);
  }

  [_open]() {
    fs.open(this[_path], this[_flags], this[_mode], (err, fd) => this[_onopen](err, fd));
  }

  [_onopen](err, fd) {
    if (this[_defaultFlag] && this[_flags] === 'r+' && err && err.code === 'ENOENT') {
      this[_flags] = 'w';
      this[_open]();
    } else if (err) {
      this[_onerror](err);
    } else {
      this[_fd] = fd;
      this.emit('open', fd);
      if (!this[_writing]) this[_flush]();
    }
  }

  end(buf, enc) {
    if (buf) this.write(buf, enc);
    this[_ended] = true;
    if (!this[_writing] && !this[_queue].length && typeof this[_fd] === 'number') {
      this[_onwrite](null, 0);
    }
    return this;
  }

  write(buf, enc) {
    if (typeof buf === 'string') buf = Buffer.from(buf, enc);
    if (this[_ended]) {
      this.emit('error', new Error('write() after end()'));
      return false;
    }
    if (this[_fd] === null || this[_writing] || this[_queue].length) {
      this[_queue].push(buf);
      this[_needDrain] = true;
      return false;
    }
    this[_writing] = true;
    this[_write](buf);
    return true;
  }

  [_write](buf) {
    fs.write(this[_fd], buf, 0, buf.length, this[_pos], (err, bytesWritten) => this[_onwrite](err, bytesWritten));
  }

  [_onwrite](err, bytesWritten) {
    if (err) {
      this[_onerror](err);
    } else {
      if (this[_pos] !== null) this[_pos] += bytesWritten;
      if (this[_queue].length) this[_flush]();
      else this[_finishWrite](bytesWritten);
    }
  }

  [_finishWrite](bytesWritten) {
    this[_writing] = false;
    if (this[_ended] && !this[_finished]) {
      this[_finished] = true;
      this[_close]();
      this.emit('finish');
    } else if (this[_needDrain]) {
      this[_needDrain] = false;
      this.emit('drain');
    }
  }

  [_flush]() {
    if (this[_queue].length === 0 && this[_ended]) {
      this[_onwrite](null, 0);
    } else if (this[_queue].length === 1) {
      this[_write](this[_queue].pop());
    } else {
      const iovec = this[_queue];
      this[_queue] = [];
      fs.writev(this[_fd], iovec, this[_pos], (err, bytesWritten) => this[_onwrite](err, bytesWritten));
    }
  }

  [_close]() {
    if (this[_autoClose] && typeof this[_fd] === 'number') {
      const fd = this[_fd];
      this[_fd] = null;
      fs.close(fd, err => err ? this.emit('error', err) : this.emit('close'));
    }
  }
}

class WriteStreamSync extends WriteStream {
  [_open]() {
    try {
      const fd = this[_defaultFlag] && this[_flags] === 'r+' ? fs.openSync(this[_path], this[_flags], this[_mode]) : fs.openSync(this[_path], this[_flags], this[_mode]);
      this[_onopen](null, fd);
    } catch (err) {
      if (this[_defaultFlag] && this[_flags] === 'r+' && err.code === 'ENOENT') {
        this[_flags] = 'w';
        return this[_open]();
      }
      throw err;
    }
  }

  [_write](buf) {
    try {
      const bytesWritten = fs.writeSync(this[_fd], buf, 0, buf.length, this[_pos]);
      this[_onwrite](null, bytesWritten);
    } catch (err) {
      try {
        this[_close]();
      } catch {}
      throw err;
    }
  }

  [_close]() {
    if (this[_autoClose] && typeof this[_fd] === 'number') {
      const fd = this[_fd];
      this[_fd] = null;
      fs.closeSync(fd);
      this.emit('close');
    }
  }
}

exports.ReadStream = ReadStream;
exports.ReadStreamSync = ReadStreamSync;
exports.WriteStream = WriteStream;
exports.WriteStreamSync = WriteStreamSync;
