// tar-stream.js
const { PassThrough, Writable } = require('stream');

// Simulated header and entry for packing example
class Entry extends PassThrough {
  constructor(header, callback) {
    super();
    this.header = header;
    process.nextTick(callback);
  }
}

// Packing stream creation
const pack = () => {
  const output = new PassThrough();

  output.entry = (header, data, callback) => {
    const entryStream = new Entry(header, callback);
    if (data) {
      entryStream.end(data);
    }
    entryStream.pipe(output, { end: false });
    return entryStream;
  };

  output.finalize = () => {
    output.end();
  };

  return output;
};

// Extracting simulation
const extract = () => {
  const extractStream = new Writable({ objectMode: true });

  extractStream.entries = [];

  extractStream._write = (entry, encoding, callback) => {
    extractStream.entries.push(entry);
    entry.resume();
    entry.on('end', callback);
  };

  extractStream.on('pipe', (src) => {
    src.unpipe(extractStream);
    for (const entry of src.entries) {
      extractStream.write(entry);
    }
    extractStream.end();
  });

  return extractStream;
};

module.exports = { pack, extract };

// Example usage
const fs = require('fs');

// Packing example
const p = pack();
p.entry({ name: 'hello.txt', size: 11 }, 'Hello world', (err) => {
  if (err) throw err;
  p.finalize();
});

p.pipe(fs.createWriteStream('example.tar'));

// Extracting example - placeholder for actual entry streams
const e = extract();
const source = pack();
source.entry({ name: 'test.txt' }, 'Test content').end();
source.finalize();

source.pipe(e);
e.on('finish', () => {
  console.log('Extracted entries:', e.entries.map(e => e.header.name));
});
