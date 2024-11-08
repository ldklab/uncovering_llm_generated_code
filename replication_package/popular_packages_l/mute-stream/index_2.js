const { Duplex } = require('stream');

class MuteStream extends Duplex {
  constructor(options = {}) {
    super(options);
    // Initialize settings
    this.muted = false; // Flag determining if output is muted
    this.replace = options.replace || null; // Replacement character if set
    this.prompt = options.prompt || ''; // Prompt if any (not used in code)
    this._isTTY = process.stdout.isTTY; // Detect if output is a terminal
  }

  _write(chunk, encoding, callback) {
    if (!this.muted) {
      if (this.replace) {
        // If replace is set, replace all characters in chunk with 'replace' character
        const replacedChunk = Buffer.from(String(chunk).replace(/./g, this.replace));
        this.push(replacedChunk);
      } else {
        // Push the chunk as is
        this.push(chunk);
      }
    }
    callback(); // Signal completion of the write process
  }

  _read(size) {
    // No operation read function, required by Duplex
  }

  mute() {
    this.muted = true; // Mutes the stream
  }

  unmute() {
    this.muted = false; // Unmutes the stream
  }

  get isTTY() {
    return this._isTTY; // Getter for terminal detection
  }
}

// Usage example
const ms = new MuteStream({ replace: '*' });
ms.pipe(process.stdout);
ms.write('foo\n');    // Outputs: foo
ms.mute();
ms.write('bar\n');    // Outputs: nothing, because stream is muted
ms.unmute();
ms.write('baz\n');    // Outputs: baz
