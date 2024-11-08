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

// Creating a packing stream
const createPackStream = () => {
  const output = new PassThrough();

  output.entry = (header, data, callback) => {
    const entryStream = new Entry(header, callback);
    if (data) entryStream.end(data);
    entryStream.pipe(output, { end: false });
    return entryStream;
  };

  output.finalize = () => output.end();

  return output;
};

// Simulating extraction
const createExtractStream = () => {
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

module.exports = { pack: createPackStream, extract: createExtractStream };

// Example usage
const fs = require('fs');

// Packing example
const packStream = createPackStream();
packStream.entry({ name: 'hello.txt', size: 11 }, 'Hello world', (err) => {
  if (err) throw err;
  packStream.finalize();
});

packStream.pipe(fs.createWriteStream('example.tar'));

// Extracting example - placeholder for actual entry streams
const extractStream = createExtractStream();
const sourceStream = createPackStream();
sourceStream.entry({ name: 'test.txt' }, 'Test content').end();
sourceStream.finalize();

sourceStream.pipe(extractStream);
extractStream.on('finish', () => {
  console.log('Extracted entries:', extractStream.entries.map(entry => entry.header.name));
});
