const { Stream } = require('stream');

class MuteStream extends Stream {
  constructor(opts = {}) {
    super();
    this.writable = this.readable = true;
    this.muted = false;
    this.replace = opts.replace;
    this._prompt = opts.prompt || null;
    this._hadControl = false;

    this.on('pipe', this._onPipe.bind(this));
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
      if (c.match(/^\u001b/)) { // Control character
        if (c.indexOf(this._prompt) === 0) {
          c = this._prompt + c.substr(this._prompt.length).replace(/./g, this.replace);
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
    if (this.muted && this.replace) {
      c = c ? c.toString().replace(/./g, this.replace) : null;
    }
    if (c) this.emit('data', c);
    this.emit('end');
  }

  proxy(fn) {
    return function () {
      const d = this._dest;
      const s = this._src;
      if (d && d[fn]) d[fn].apply(d, arguments);
      if (s && s[fn]) s[fn].apply(s, arguments);
    };
  }
}

['destroy', 'destroySoon', 'close'].forEach(fn => {
  MuteStream.prototype[fn] = MuteStream.prototype.proxy(fn);
});

module.exports = MuteStream;
