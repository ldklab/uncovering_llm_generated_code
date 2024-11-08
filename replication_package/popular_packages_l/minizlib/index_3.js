const { Transform } = require('stream');
const zlib = require('zlib');
const Minipass = require('minipass');

class MinipassDecompressor extends Minipass {
  constructor(options, decompressEngine) {
    super(options);
    this.decompressEngine = decompressEngine;
    this.decompressEngine.on('data', chunk => this.write(chunk));
    this.decompressEngine.on('end', () => this.end());
  }

  write(chunk, encoding, callback) {
    return super.write(chunk, encoding, callback);
  }

  end(chunk, encoding, callback) {
    if (chunk) {
      this.write(chunk, encoding, callback);
    }
    this.decompressEngine.end();
  }
}

class BrotliDecompressionStream extends MinipassDecompressor {
  constructor(options) {
    super(options, zlib.createBrotliDecompress(options));
  }
}

function generateCompressedData() {
  const input = new Transform();
  process.nextTick(() => {
    input.push(Buffer.from('compressed data here', 'binary'));
    input.push(null);
  });
  return input;
}

function logDecompressedData() {
  const output = new Transform({
    transform(chunk, encoding, callback) {
      console.log('Decoded:', chunk.toString());
      callback(null, chunk);
    }
  });

  output.on('finish', () => {
    console.log('Decompression complete.');
  });

  return output;
}

const compressedInput = generateCompressedData();
const decompressionStream = new BrotliDecompressionStream();
const loggingOutput = logDecompressedData();

compressedInput.pipe(decompressionStream).pipe(loggingOutput);
