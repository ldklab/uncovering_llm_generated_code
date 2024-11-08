const Stream = require('stream');

class MuteStream extends Stream {
  #isTTY = null;
  
  constructor(opts = {}) {
    super(opts);
    this.writable = true;
    this.readable = true;
    this.muted = false;
    this.replace = opts.replace || '';
    this._prompt = opts.prompt || '';
    this._hadControl = false;  

    this.on('pipe', this._onPipe);
  }

  #destSrc(key, fallback) {
    if (this._dest) return this._dest[key];
    if (this._src) return this._src[key];
    return fallback;
  }

  #proxy(method, ...args) {
    if (typeof this._dest?.[method] === 'function')
      this._dest[method](...args);
    if (typeof this._src?.[method] === 'function')
      this._src[method](...args);
  }

  get isTTY() {
    return this.#isTTY !== null ? this.#isTTY : this.#destSrc('isTTY', false);
  }

  set isTTY(value) {
    this.#isTTY = value;
  }

  get rows() {
    return this.#destSrc('rows');
  }

  get columns() {
    return this.#destSrc('columns');
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  _onPipe(src) {
    this._src = src;
  }

  pipe(dest, options) {
    this._dest = dest;
    return super.pipe(dest, options);
  }

  pause() {
    return this._src?.pause();
  }

  resume() {
    return this._src?.resume();
  }

  write(chunk) {
    if (this.muted) {
      if (!this.replace) return true;

      if (/^\u001b/.test(chunk)) {
        if (chunk.startsWith(this._prompt)) {
          chunk = this._prompt + chunk.slice(this._prompt.length).replace(/./g, this.replace);
        }
        this._hadControl = true;
      } else {
        if (this._prompt && this._hadControl && chunk.startsWith(this._prompt)) {
          this.emit('data', this._prompt);
          chunk = chunk.slice(this._prompt.length);
          this._hadControl = false;
        }
        chunk = chunk.replace(/./g, this.replace);
      }
    }
    this.emit('data', chunk);
  }

  end(chunk) {
    if (this.muted && chunk && this.replace) {
      chunk = chunk.toString().replace(/./g, this.replace);
    }
    if (chunk) this.emit('data', chunk);
    this.emit('end');
  }

  destroy(...args) {
    this.#proxy('destroy', ...args);
  }

  destroySoon(...args) {
    this.#proxy('destroySoon', ...args);
  }

  close(...args) {
    this.#proxy('close', ...args);
  }
}

module.exports = MuteStream;
