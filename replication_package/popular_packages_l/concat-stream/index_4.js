const { Writable } = require('stream');

function concatStream(options = {}, callback = () => {}) {
  // Handle the case where options are not passed, and only a callback is provided
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  let collectedData = [];
  let dataEncoding = options.encoding;

  const writableStream = new Writable({
    objectMode: true,
    write(chunk, encoding, next) {
      if (!dataEncoding) {
        dataEncoding = determineEncoding(chunk);
      }
      collectedData.push(chunk);
      next();
    },
    final(done) {
      const result = processCollectedData(collectedData, dataEncoding);
      callback(result);
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

function processCollectedData(data, encoding) {
  switch (encoding) {
    case 'string':
      return data.join('');
    case 'buffer':
      return Buffer.concat(data.map(item => Buffer.isBuffer(item) ? item : Buffer.from(item)));
    case 'array':
      return data.flat();
    case 'uint8array':
      let totalLength = data.reduce((sum, item) => sum + item.length, 0);
      let combinedUint8Array = new Uint8Array(totalLength);
      let offset = 0;
      data.forEach(item => {
        const currentItem = item instanceof Uint8Array ? item : Uint8Array.from(Buffer.from(item));
        combinedUint8Array.set(currentItem, offset);
        offset += currentItem.length;
      });
      return combinedUint8Array;
    case 'object':
      return data;
    default:
      return Buffer.concat(data.map(item => Buffer.from(item)));
  }
}

module.exports = concatStream;
