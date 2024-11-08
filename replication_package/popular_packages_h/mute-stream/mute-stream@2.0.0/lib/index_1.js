const { Stream } = require('stream');

class MuteStream extends Stream {
  #isTTY = null;

  constructor(options = {}) {
    super(options);
    this.writable = this.readable = true;
    this.muted = false;
    this.on('pipe', this._onPipe);
    this.replace = options.replace;
    this._prompt = options.prompt || null;
    this._hadControl = false;
  }

  #getPropertyFromSrcDest(property, defaultValue) {
    return this._dest?.[property] ?? this._src?.[property] ?? defaultValue;
  }

  #invokeOnSrcDest(method, ...args) {
    if (typeof this._dest?.[method] === 'function') {
      this._dest[method](...args);
    }
    if (typeof this._src?.[method] === 'function') {
      this._src[method](...args);
    }
  }

  get isTTY() {
    return this.#isTTY !== null ? this.#isTTY : this.#getPropertyFromSrcDest('isTTY', false);
  }

  set isTTY(value) {
    this.#isTTY = value;
  }

  get rows() {
    return this.#getPropertyFromSrcDest('rows');
  }

  get columns() {
    return this.#getPropertyFromSrcDest('columns');
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  _onPipe(source) {
    this._src = source;
  }

  pipe(destination, options) {
    this._dest = destination;
    return super.pipe(destination, options);
  }

  pause() {
    this._src?.pause();
  }

  resume() {
    this._src?.resume();
  }

  write(chunk) {
    if (this.muted) {
      if (!this.replace) {
        return true;
      }
      if (/^\u001b/.test(chunk)) {
        if (chunk.startsWith(this._prompt)) {
          chunk = this._prompt + chunk.slice(this._prompt.length).replace(/./g, this.replace);
        }
        this._hadControl = true;
        return this.emit('data', chunk);
      }
      if (this._prompt && this._hadControl && chunk.startsWith(this._prompt)) {
        this._hadControl = false;
        this.emit('data', this._prompt);
        chunk = chunk.slice(this._prompt.length);
      }
      chunk = chunk.replace(/./g, this.replace);
    }
    this.emit('data', chunk);
  }

  end(chunk) {
    if (this.muted && chunk && this.replace) {
      chunk = chunk.replace(/./g, this.replace);
    } else {
      chunk = null;
    }
    if (chunk) {
      this.emit('data', chunk);
    }
    this.emit('end');
  }

  destroy(...args) {
    this.#invokeOnSrcDest('destroy', ...args);
  }

  destroySoon(...args) {
    this.#invokeOnSrcDest('destroySoon', ...args);
  }

  close(...args) {
    this.#invokeOnSrcDest('close', ...args);
  }
}

module.exports = MuteStream;
