const { Transform } = require('stream');

class SplitStream extends Transform {
  constructor(delimiter = /\r?\n/, transformFunc, opts = {}) {
    super({ readableObjectMode: !!transformFunc, ...opts });
    this.delimiter = delimiter;
    this.transformFunc = transformFunc;
    this.buffer = '';
    this.maxLen = opts.maxLength;
    this.skipLongLines = opts.skipOverflow || false;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();

    let parts = this.buffer.split(this.delimiter);
    this.buffer = parts.pop();

    for (let part of parts) {
      if (this.maxLen && part.length > this.maxLen) {
        if (!this.skipLongLines) return callback(new Error('Line exceeded maxLength'));
        continue;
      }
      
      if (this.transformFunc) {
        try {
          part = this.transformFunc(part);
        } catch (e) {
          return callback(e);
        }
      }

      this.push(part);
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      let line = this.buffer;
      if (this.maxLen && line.length > this.maxLen) {
        if (!this.skipLongLines) return callback(new Error('Line exceeded maxLength'));
      } else {
        try {
          if (this.transformFunc) line = this.transformFunc(line);
          this.push(line);
        } catch (e) {
          return callback(e);
        }
      }
    }
    callback();
  }
  
  destroy() {
    this.emit('close');
    super.destroy();
  }
}

module.exports = (delimiter, transformFunc, opts) => new SplitStream(delimiter, transformFunc, opts);
