const { Writable } = require('stream');

function concatStream(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  let collectedData = [];
  let detectedEncoding;

  const writableStream = new Writable({
    objectMode: true,
    write(chunk, encoding, next) {
      if (!detectedEncoding) {
        detectedEncoding = determineEncoding(chunk);
      }
      collectedData.push(chunk);
      next();
    },
    final(done) {
      const combinedResult = combineData(collectedData, detectedEncoding);
      callback(combinedResult);
      done();
    }
  });

  return writableStream;
}

function determineEncoding(chunk) {
  if (Buffer.isBuffer(chunk)) return 'buffer';
  if (typeof chunk === 'string') return 'string';
  if (Array.isArray(chunk)) return 'array';
  if (chunk instanceof Uint8Array) return 'uint8array';
  return 'object';
}

function combineData(data, encoding) {
  switch (encoding) {
    case 'string':
      return data.join('');
    case 'buffer':
      return Buffer.concat(data.map(item => Buffer.isBuffer(item) ? item : Buffer.from(item)));
    case 'array':
      return data.flat();
    case 'uint8array':
      let totalLength = data.reduce((acc, item) => acc + item.length, 0);
      let combined = new Uint8Array(totalLength);
      let position = 0;
      data.forEach(item => {
        if (!(item instanceof Uint8Array)) item = Uint8Array.from(Buffer.from(item));
        combined.set(item, position);
        position += item.length;
      });
      return combined;
    case 'object':
      return data;
    default:
      return Buffer.concat(data.map(item => Buffer.from(item)));
  }
}

module.exports = concatStream;
