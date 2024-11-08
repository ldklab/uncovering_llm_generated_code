const { Transform } = require('stream');
const zlib = require('zlib');
const Minipass = require('minipass');

class MinizlibBase extends Minipass {
  constructor(opts, engine) {
    super(opts);
    this._engine = engine;
    this._engine.on('data', chunk => this.write(chunk));
    this._engine.on('end', () => this.end());
  }

  write(chunk, encoding, callback) {
    return super.write(chunk, encoding, callback);
  }

  end(chunk, encoding, callback) {
    if (chunk) {
      this.write(chunk, encoding, callback);
    }
    this._engine.end();
  }
}

class BrotliDecompress extends MinizlibBase {
  constructor(opts) {
    super(opts, zlib.createBrotliDecompress(opts));
  }
}

const sourceOfCompressedData = () => {
  const input = new Transform();
  setImmediate(() => {
    input.push(Buffer.from('compressed data here', 'binary'));
    input.push(null);
  });
  return input;
};

const whereToWriteTheDecodedData = () => {
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
};

const input = sourceOfCompressedData();
const decode = new BrotliDecompress();
const output = whereToWriteTheDecodedData();
input.pipe(decode).pipe(output);
