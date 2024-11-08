const { Transform } = require('stream');

class LineSplitter extends Transform {
  constructor(matcher = /\r?\n/, mapper, options = {}) {
    super({ readableObjectMode: !!mapper, ...options });
    this.matcher = matcher;
    this.mapper = mapper;
    this.buffer = '';
    this.maxLength = options.maxLength;
    this.skipOverflow = options.skipOverflow || false;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    let lines = this.buffer.split(this.matcher);
    this.buffer = lines.pop();

    for (let line of lines) {
      if (this.maxLength && line.length > this.maxLength) {
        if (this.skipOverflow) continue;
        return callback(new Error('Line exceeded maxLength'));
      }
      
      if (this.mapper) {
        try {
          line = this.mapper(line);
        } catch (error) {
          return callback(error);
        }
      }

      this.push(line);
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      let line = this.buffer;
      if (this.maxLength && line.length > this.maxLength) {
        if (!this.skipOverflow) return callback(new Error('Line exceeded maxLength'));
      } else {
        try {
          if (this.mapper) line = this.mapper(line);
          this.push(line);
        } catch (error) {
          return callback(error);
        }
      }
    }
    callback();
  }
  
  destroy(err, callback) {
    this.emit('close');
    super.destroy(err, callback);
  }
}

module.exports = (matcher, mapper, options) => new LineSplitter(matcher, mapper, options);
