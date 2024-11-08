const Stream = require('stream');

class MuteStream extends Stream {
  constructor(opts = {}) {
    super();
    this.writable = this.readable = true;
    this.muted = false;
    this.on('pipe', this._onpipe.bind(this));
    this.replace = opts.replace;

    this._prompt = opts.prompt || null;
    this._hadControl = false;
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  _onpipe(src) {
    this._src = src;
  }

  get isTTY() {
    return this._dest ? this._dest.isTTY : this._src ? this._src.isTTY : false;
  }

  set isTTY(isTTY) {
    Object.defineProperty(this, 'isTTY', {
      value: isTTY,
      enumerable: true,
      writable: true,
      configurable: true,
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

  write(c) {
    if (this.muted) {
      if (!this.replace) return true;
      if (c.match(/^\u001b/)) {
        if(c.indexOf(this._prompt) === 0) {
          c = c.substr(this._prompt.length);
          c = c.replace(/./g, this.replace);
          c = this._prompt + c;
        }
        this._hadControl = true;
        return this.emit('data', c);
      } else {
        if (this._prompt && this._hadControl && c.indexOf(this._prompt) === 0) {
          this._hadControl = false;
          this.emit('data', this._prompt);
          c = c.substr(this._prompt.length);
        }
        c = c.toString().replace(/./g, this.replace);
      }
    }
    this.emit('data', c);
  }

  end(c) {
    if (this.muted && c && this.replace) {
      c = c.toString().replace(/./g, this.replace);
    }
    if (c) this.emit('data', c);
    this.emit('end');
  }

  destroy(...args) {
    if (this._dest && typeof this._dest.destroy === 'function') this._dest.destroy(...args);
    if (this._src && typeof this._src.destroy === 'function') this._src.destroy(...args);
  }

  destroySoon(...args) {
    if (this._dest && typeof this._dest.destroySoon === 'function') this._dest.destroySoon(...args);
    if (this._src && typeof this._src.destroySoon === 'function') this._src.destroySoon(...args);
  }

  close(...args) {
    if (this._dest && typeof this._dest.close === 'function') this._dest.close(...args);
    if (this._src && typeof this._src.close === 'function') this._src.close(...args);
  }
}

module.exports = MuteStream;
