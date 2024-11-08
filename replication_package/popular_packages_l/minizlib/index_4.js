const { Transform } = require('stream');
const zlib = require('zlib');
const Minipass = require('minipass');

// Base class for decompression using Minipass and a given engine
class MinizlibBase extends Minipass {
  constructor(opts, engine) {
    super(opts);
    this._engine = engine;
    this._engine.on('data', chunk => this.write(chunk)); // Write decompressed data
    this._engine.on('end', () => this.end()); // End the stream when decompression engine signals
  }

  // Overrides write method from Minipass
  write(chunk, encoding, callback) {
    return super.write(chunk, encoding, callback);
  }

  // End method to handle final chunk and end the engine
  end(chunk, encoding, callback) {
    if (chunk) {
      this.write(chunk, encoding, callback); // Writes final chunk if provided
    }
    this._engine.end(); // Ends the decompression engine
  }
}

// Specific class for Brotli decompression
class BrotliDecompress extends MinizlibBase {
  constructor(opts) {
    super(opts, zlib.createBrotliDecompress(opts)); // Initialize with Brotli decompression engine
  }
}

// Simulates a stream of compressed data
const sourceOfCompressedData = () => {
  const input = new Transform();
  setImmediate(() => { // Simulate asynchronous data push
    input.push(Buffer.from('compressed data here', 'binary')); // Sample compressed data
    input.push(null); // Signal end of data
  });
  return input;
};

// Handles decompressed data by logging it
const whereToWriteTheDecodedData = () => {
  const output = new Transform({
    transform(chunk, encoding, callback) {
      console.log('Decoded:', chunk.toString()); // Logs each decompressed chunk
      callback(null, chunk); // Passes chunk down the pipeline
    }
  });

  output.on('finish', () => {
    console.log('Decompression complete.'); // Signals when decompression is done
  });

  return output;
};

// Create and connect the compression pipeline
const input = sourceOfCompressedData();
const decode = new BrotliDecompress();
const output = whereToWriteTheDecodedData();
input.pipe(decode).pipe(output); // Connect the stream pipeline
