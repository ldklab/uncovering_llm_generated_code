const { Writable } = require('stream');

function concatStream(opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  let data = [];
  let encoding = opts.encoding;

  const writable = new Writable({
    objectMode: true,
    write(chunk, enc, next) {
      if (!encoding) {
        encoding = detectEncoding(chunk);
      }
      data.push(chunk);
      next();
    },
    final(callback) {
      const result = concatenateData(data, encoding);
      cb(result);
      callback();
    }
  });

  return writable;
}

function detectEncoding(chunk) {
  if (Buffer.isBuffer(chunk)) return 'buffer';
  if (typeof chunk === 'string') return 'string';
  if (Array.isArray(chunk)) return 'array';
  if (chunk instanceof Uint8Array) return 'uint8array';
  return 'object';
}

function concatenateData(data, encoding) {
  switch (encoding) {
    case 'string':
      return data.join('');
    case 'buffer':
      return Buffer.concat(data.map(item => Buffer.isBuffer(item) ? item : Buffer.from(item)));
    case 'array':
      return data.flat();
    case 'uint8array':
      const totalLength = data.reduce((sum, item) => sum + item.length, 0);
      const concatenated = new Uint8Array(totalLength);
      let offset = 0;
      data.forEach(item => {
        item = item instanceof Uint8Array ? item : Uint8Array.from(Buffer.from(item));
        concatenated.set(item, offset);
        offset += item.length;
      });
      return concatenated;
    case 'object':
      return data;
    default:
      return Buffer.concat(data.map(item => Buffer.from(item)));
  }
}

module.exports = concatStream;
