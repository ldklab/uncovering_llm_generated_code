const { Transform } = require('stream');

class LineSplitter extends Transform {
  constructor(separator = /\r?\n/, transformFunction, options = {}) {
    const objectMode = !!transformFunction;
    super({ readableObjectMode: objectMode, ...options });

    this.separator = separator;
    this.transformFunction = transformFunction;
    this.buffer = '';
    this.maxLength = options.maxLength;
    this.skipLongLines = options.skipOverflow || false;
  }

  _transform(chunk, encoding, done) {
    this.buffer += chunk.toString();

    const segments = this.buffer.split(this.separator);
    this.buffer = segments.pop();

    for (let segment of segments) {
      if (this.maxLength && segment.length > this.maxLength) {
        if (!this.skipLongLines) return done(new Error('Segment exceeds maximum length'));
        continue;
      }

      if (this.transformFunction) {
        try {
          segment = this.transformFunction(segment);
        } catch (error) {
          return done(error);
        }
      }

      this.push(segment);
    }

    done();
  }

  _flush(done) {
    if (this.buffer) {
      let segment = this.buffer;
      if (this.maxLength && segment.length > this.maxLength) {
        if (!this.skipLongLines) return done(new Error('Segment exceeds maximum length'));
      } else {
        try {
          if (this.transformFunction) segment = this.transformFunction(segment);
          this.push(segment);
        } catch (error) {
          return done(error);
        }
      }
    }
    done();
  }

  destroy() {
    this.emit('close');
    super.destroy();
  }
}

module.exports = (separator, transformFunction, options) => new LineSplitter(separator, transformFunction, options);
