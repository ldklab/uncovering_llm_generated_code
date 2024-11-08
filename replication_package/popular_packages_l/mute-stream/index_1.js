const { Duplex } = require('stream');

class MuteStream extends Duplex {
  constructor(options = {}) {
    super(options);
    this.muted = false;
    this.replace = options.replace || null;
    this.prompt = options.prompt || '';
    this._isTTY = process.stdout.isTTY;
  }

  _write(chunk, encoding, callback) {
    if (!this.muted) {
      if (this.replace) {
        const replacedContent = Buffer.from(String(chunk).replace(/./g, this.replace));
        this.push(replacedContent);
      } else {
        this.push(chunk);
      }
    }
    callback();
  }

  _read(size) {}

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  get isTTY() {
    return this._isTTY;
  }
}

// Usage example
const ms = new MuteStream({ replace: '*' });
ms.pipe(process.stdout);
ms.write('foo\n');    // Outputs: foo
ms.mute();
ms.write('bar\n');    // Outputs: nothing
ms.unmute();
ms.write('baz\n');    // Outputs: baz
