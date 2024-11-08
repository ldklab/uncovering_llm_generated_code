const Stream = require('stream');

class MuteStream extends Stream {
  #isTTY = null;

  constructor(opts = {}) {
    super(opts);
    this.writable = this.readable = true;
    this.muted = false;
    this.replace = opts.replace;
    this._prompt = opts.prompt || null;
    this._hadControl = false;
    this.on('pipe', this._onPipe);
  }

  #getSrcDestProperty(key, defaultValue) {
    if (this._dest) return this._dest[key];
    if (this._src) return this._src[key];
    return defaultValue;
  }

  #proxyMethod(method, ...args) {
    if (typeof this._dest?.[method] === 'function') {
      this._dest[method](...args);
    }
    if (typeof this._src?.[method] === 'function') {
      this._src[method](...args);
    }
  }

  get isTTY() {
    return this.#isTTY !== null ? this.#isTTY : this.#getSrcDestProperty('isTTY', false);
  }

  set isTTY(val) {
    this.#isTTY = val;
  }

  get rows() {
    return this.#getSrcDestProperty('rows');
  }

  get columns() {
    return this.#getSrcDestProperty('columns');
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
    if (this._src) return this._src.pause();
  }

  resume() {
    if (this._src) return this._src.resume();
  }

  write(chunk) {
    if (this.muted) {
      if (!this.replace) return true;

      if (/^\u001b/.test(chunk)) {
        if (chunk.indexOf(this._prompt) === 0) {
          chunk = this._prompt + chunk.slice(this._prompt.length).replace(/./g, this.replace);
        }
        this._hadControl = true;
        return this.emit('data', chunk);
      }

      if (this._prompt && this._hadControl && chunk.indexOf(this._prompt) === 0) {
        this._hadControl = false;
        this.emit('data', this._prompt);
        chunk = chunk.slice(this._prompt.length);
      }
      
      chunk = chunk.toString().replace(/./g, this.replace);
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
    return this.#proxyMethod('destroy', ...args);
  }

  destroySoon(...args) {
    return this.#proxyMethod('destroySoon', ...args);
  }

  close(...args) {
    return this.#proxyMethod('close', ...args);
  }
}

module.exports = MuteStream;
