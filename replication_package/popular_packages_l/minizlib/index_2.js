const { Transform } = require('stream');
const zlib = require('zlib');
const Minipass = require('minipass');

class MinizlibBase extends Minipass {
  constructor(options, engine) {
    super(options);
    this._engine = engine;
    this._engine.on('data', chunk => this.write(chunk));
    this._engine.on('end', () => this.end());
  }

  write(chunk, encoding, callback) {
    return super.write(chunk, encoding, callback);
  }

  end(chunk, encoding, callback) {
    if (chunk) this.write(chunk, encoding, callback);
    this._engine.end();
  }
}

class BrotliDecompress extends MinizlibBase {
  constructor(options) {
    super(options, zlib.createBrotliDecompress(options));
  }
}

function sourceOfCompressedData() {
  const inputStream = new Transform();
  setImmediate(() => {
    inputStream.push(Buffer.from('compressed data here', 'binary'));
    inputStream.push(null);
  });
  return inputStream;
}

function whereToWriteTheDecodedData() {
  const outputStream = new Transform({
    transform(chunk, encoding, callback) {
      console.log('Decoded:', chunk.toString());
      callback(null, chunk);
    }
  });

  outputStream.on('finish', () => {
    console.log('Decompression complete.');
  });

  return outputStream;
}

const inputStream = sourceOfCompressedData();
const decoder = new BrotliDecompress();
const outputStream = whereToWriteTheDecodedData();

inputStream.pipe(decoder).pipe(outputStream);
