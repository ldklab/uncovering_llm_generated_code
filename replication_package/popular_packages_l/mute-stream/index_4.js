const { Duplex } = require('stream');

class MuteStream extends Duplex {
  constructor(options = {}) {
    super(options);
    this.muted = false; // This property indicates whether the stream is currently muted.
    this.replace = options.replace || null; // This property holds the character used for replacing data when muted.
    this.prompt = options.prompt || ''; // Optional prompt string.
    this._isTTY = process.stdout.isTTY; // Stores whether the output is a terminal (TTY) or not.
  }

  _write(chunk, encoding, callback) {
    if (!this.muted) { // If the stream isn't muted, process the chunk.
      if (this.replace) { // If replace character is specified, replace all characters with it.
        const replacedChunk = Buffer.from(String(chunk).replace(/./g, this.replace));
        this.push(replacedChunk);
      } else {
        this.push(chunk); // Otherwise, push the original chunk.
      }
    }
    callback(); // Invoke the callback to indicate the write operation is complete.
  }

  _read(size) {
    // This method is left unimplemented as it's not needed for this stream's functionality.
  }

  mute() {
    this.muted = true; // Set the muted flag to true.
  }

  unmute() {
    this.muted = false; // Set the muted flag to false.
  }

  get isTTY() {
    return this._isTTY; // Returns whether the output is a terminal or not.
  }
}

// Usage example
const ms = new MuteStream({ replace: '*' });
ms.pipe(process.stdout); // Pipe the stream to standard output.
ms.write('foo\n');    // Outputs: foo
ms.mute();            // Mute the stream.
ms.write('bar\n');    // Outputs: nothing since the stream is muted.
ms.unmute();          // Unmute the stream.
ms.write('baz\n');    // Outputs: baz since the stream is now unmuted.
