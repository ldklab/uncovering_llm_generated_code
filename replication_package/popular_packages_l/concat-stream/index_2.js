const { Writable } = require('stream');

function concatStream(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const chunks = [];
  let detectedEncoding = options.encoding;

  const stream = new Writable({
    objectMode: true,
    write(chunk, enc, next) {
      if (!detectedEncoding) detectedEncoding = getEncoding(chunk);
      chunks.push(chunk);
      next();
    },
    final(done) {
      const combinedData = mergeData(chunks, detectedEncoding);
      callback(combinedData);
      done();
    }
  });

  return stream;
}

function getEncoding(chunk) {
  if (Buffer.isBuffer(chunk)) return 'buffer';
  if (typeof chunk === 'string') return 'string';
  if (Array.isArray(chunk)) return 'array';
  if (chunk instanceof Uint8Array) return 'uint8array';
  return 'object';
}

function mergeData(chunks, encoding) {
  switch (encoding) {
    case 'string':
      return chunks.join('');
    case 'buffer':
      return Buffer.concat(chunks.map(c => Buffer.isBuffer(c) ? c : Buffer.from(c)));
    case 'array':
      return chunks.flat();
    case 'uint8array':
      const length = chunks.reduce((len, c) => len + c.length, 0);
      const merged = new Uint8Array(length);
      let position = 0;
      chunks.forEach(c => {
        c = c instanceof Uint8Array ? c : Uint8Array.from(Buffer.from(c));
        merged.set(c, position);
        position += c.length;
      });
      return merged;
    case 'object':
      return chunks;
    default:
      return Buffer.concat(chunks.map(c => Buffer.from(c)));
  }
}

module.exports = concatStream;
