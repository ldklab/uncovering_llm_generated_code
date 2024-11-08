const { Transform } = require('stream');

class Split2 extends Transform {
  constructor(matcher = /\r?\n/, mapper, options = {}) {
    super({ readableObjectMode: !!mapper, ...options });
    this.matcher = matcher;
    this.mapper = mapper;
    this.buf = '';
    this.maxLength = options.maxLength;
    this.skipOverflow = options.skipOverflow || false;
  }

  _transform(chunk, encoding, callback) {
    this.buf += chunk.toString();

    let lines = this.buf.split(this.matcher);
    this.buf = lines.pop();

    for (let line of lines) {
      if (this.maxLength && line.length > this.maxLength) {
        if (!this.skipOverflow) return callback(new Error('Line exceeded maxLength'));
        continue; // Skip long lines if skipOverflow is true
      }
      
      if (this.mapper) {
        try {
          line = this.mapper(line);
        } catch (err) {
          return callback(err);
        }
      }

      this.push(line);
    }

    callback();
  }

  _flush(callback) {
    if (this.buf) {
      let line = this.buf;
      if (this.maxLength && line.length > this.maxLength) {
        if (!this.skipOverflow) return callback(new Error('Line exceeded maxLength'));
      } else {
        try {
          if (this.mapper) line = this.mapper(line);
          this.push(line);
        } catch (err) {
          return callback(err);
        }
      }
    }
    callback();
  }
  
  destroy() {
    // Emit close event for the stream
    this.emit('close');
    // Execute cleanup if required
    super.destroy();
  }
}

module.exports = (matcher, mapper, options) => new Split2(matcher, mapper, options);
