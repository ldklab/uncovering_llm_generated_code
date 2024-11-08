const { Writable } = require('stream');

module.exports = class MuteStream extends Writable {
  constructor(opts = {}) {
    super();
    this.muted = false;
    this.replace = opts.replace;
    this._prompt = opts.prompt || null;
    this._hadControl = false;
    this._src = null;
    this._dest = null;
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
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  get rows() {
    return this._dest?.rows ?? this._src?.rows;
  }

  get columns() {
    return this._dest?.columns ?? this._src?.columns;
  }

  pipe(dest, options) {
    this._dest = dest;
    return super.pipe(dest, options);
  }

  pause() {
    this._src?.pause();
  }

  resume() {
    this._src?.resume();
  }

  _write(chunk, encoding, callback) {
    let output = chunk;

    if (this.muted && this.replace) {
      if (chunk.match(/^\u001b/)) { // Handle escape sequences
        if (chunk.indexOf(this._prompt) === 0) {
          chunk = chunk.slice(this._prompt.length).replace(/./g, this.replace);
          output = this._prompt + chunk;
        }
        this._hadControl = true;
      } else {
        if (this._prompt && this._hadControl && chunk.indexOf(this._prompt) === 0) {
          this._hadControl = false;
          this.emit('data', this._prompt);
          chunk = chunk.slice(this._prompt.length);
        }
        output = chunk.toString().replace(/./g, this.replace);
      }
    }
    
    this.emit('data', output);
    callback();
  }

  end(chunk) {
    if (this.muted && chunk && this.replace) {
      chunk = chunk.toString().replace(/./g, this.replace);
    }
    if (chunk) this.emit('data', chunk);
    this.emit('end');
  }

  _proxyMethod(method) {
    return (...args) => {
      if (this._dest && typeof this._dest[method] === 'function') {
        this._dest[method](...args);
      }
      if (this._src && typeof this._src[method] === 'function') {
        this._src[method](...args);
      }
    };
  }

  destroy(...args) {
    this._proxyMethod('destroy')(...args);
  }

  destroySoon(...args) {
    this._proxyMethod('destroySoon')(...args);
  }

  close(...args) {
    this._proxyMethod('close')(...args);
  }
};
