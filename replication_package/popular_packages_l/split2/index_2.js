const { Transform } = require('stream');

class SplitStream extends Transform {
  constructor(delimiter = /\r?\n/, transformLine, options = {}) {
    // Initialize with readableObjectMode if a transformLine function is provided, along with other options
    super({ readableObjectMode: !!transformLine, ...options });
    this.delimiter = delimiter;
    this.transformLine = transformLine;
    this.buffer = '';
    this.maximumLength = options.maxLength;
    this.ignoreOverflow = options.skipOverflow || false;
  }

  _transform(chunk, encoding, callback) {
    // Add new data to the buffer
    this.buffer += chunk.toString();

    // Split the buffer into lines using the delimiter
    let lines = this.buffer.split(this.delimiter);
    this.buffer = lines.pop(); // The last piece might be an incomplete line, keep it in buffer

    for (let line of lines) {
      // Check for line length limit
      if (this.maximumLength && line.length > this.maximumLength) {
        if (!this.ignoreOverflow) return callback(new Error('Line exceeded maximumLength'));
        continue; // Skip processing this line if ignoreOverflow is enabled
      }

      // Apply the line transformation if provided
      if (this.transformLine) {
        try {
          line = this.transformLine(line);
        } catch (error) {
          return callback(error); // Stop and pass the error if transformation fails
        }
      }

      // Push the processed line to the readable side of the stream
      this.push(line);
    }

    // Continue processing
    callback();
  }

  _flush(callback) {
    // Process any data left in the buffer when the stream ends
    if (this.buffer) {
      let line = this.buffer;
      if (this.maximumLength && line.length > this.maximumLength) {
        if (!this.ignoreOverflow) return callback(new Error('Line exceeded maximumLength'));
      } else {
        try {
          if (this.transformLine) line = this.transformLine(line);
          this.push(line);
        } catch (error) {
          return callback(error); // Handle any transformation error
        }
      }
    }
    callback();
  }

  destroy() {
    // Emit a close event and clean up any allocated resources
    this.emit('close');
    super.destroy();
  }
}

// Helper function to create a new instance of SplitStream
module.exports = (delimiter, transformLine, options) => new SplitStream(delimiter, transformLine, options);
