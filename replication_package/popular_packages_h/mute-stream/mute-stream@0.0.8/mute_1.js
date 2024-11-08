const { Stream } = require('stream');

class MuteStream extends Stream {
  constructor(opts = {}) {
    super();
    this.writable = this.readable = true;
    this.muted = false;
    this.replace = opts.replace || false;
    this._prompt = opts.prompt || '';
    this._hadControl = false;
    this.on('pipe', src => this._src = src);
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  get isTTY() {
    return this._dest ? this._dest.isTTY : this._src ? this._src.isTTY : false;
  }

  set isTTY(value) {
    Object.defineProperty(this, 'isTTY', {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  get rows() {
    return this._dest ? this._dest.rows : this._src ? this._src.rows : undefined;
  }

  get columns() {
    return this._dest ? this._dest.columns : this._src ? this._src.columns : undefined;
  }

  pipe(dest, options) {
    this._dest = dest;
    return super.pipe(dest, options);
  }

  pause() {
    if (this._src) return this._src.pause();
  }

  resume() {
    if (this._src) return this._src.resume();
  }

  write(chunk) {
    if (this.muted) {
      let toEmit = chunk.toString();
      if (this.replace) {
        if (toEmit.match(/^\u001b/)) {
          this._hadControl = true;
        } else if (this._prompt && this._hadControl) {
          this._hadControl = false;
          this.emit('data', this._prompt);
          toEmit = toEmit.substr(this._prompt.length);
        }
        toEmit = toEmit.replace(/./g, this.replace);
      }
      this.emit('data', toEmit);
      return true;
    }
    this.emit('data', chunk);
    return true;
  }

  end(chunk) {
    if (this.muted && chunk) {
      chunk = chunk.toString().replace(/./g, this.replace);
    }
    if (chunk) this.emit('data', chunk);
    this.emit('end');
  }

  _proxyFunction(fnName) {
    return (...args) => {
      if (this._dest && this._dest[fnName]) this._dest[fnName](...args);
      if (this._src && this._src[fnName]) this._src[fnName](...args);
    };
  }

  destroy = this._proxyFunction('destroy');
  destroySoon = this._proxyFunction('destroySoon');
  close = this._proxyFunction('close');
}

module.exports = MuteStream;
