const Stream = require('stream');

class MuteStream extends Stream {
  #isTTY = null;

  constructor(opts = {}) {
    super(opts);
    this.writable = this.readable = true;
    this.muted = false;
    this.replace = opts.replace || null;
    this._prompt = opts.prompt || null;
    this._hadControl = false;

    this.on('pipe', this._onPipe);
  }

  #getDestSrcProp(key, def) {
    return this._dest?.[key] ?? this._src?.[key] ?? def;
  }

  #proxyMethod(method, ...args) {
    this._dest?.[method]?.(...args);
    this._src?.[method]?.(...args);
  }

  get isTTY() {
    return this.#isTTY ?? this.#getDestSrcProp('isTTY', false);
  }

  set isTTY(val) {
    this.#isTTY = val;
  }

  get rows() {
    return this.#getDestSrcProp('rows');
  }

  get columns() {
    return this.#getDestSrcProp('columns');
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
    this._src?.pause();
  }

  resume() {
    this._src?.resume();
  }

  write(chunk) {
    if (this.muted) {
      if (!this.replace) return true;

      if (chunk.match(/^\u001b/)) {
        if (chunk.startsWith(this._prompt)) {
          chunk = this._prompt + chunk.slice(this._prompt.length).replace(/./g, this.replace);
        }
        this._hadControl = true;
      } else if (this._prompt && this._hadControl && chunk.startsWith(this._prompt)) {
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
    this.#proxyMethod('destroy', ...args);
  }

  destroySoon(...args) {
    this.#proxyMethod('destroySoon', ...args);
  }

  close(...args) {
    this.#proxyMethod('close', ...args);
  }
}

module.exports = MuteStream;
