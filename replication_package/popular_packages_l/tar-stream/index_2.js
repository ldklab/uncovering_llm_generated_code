const { PassThrough, Writable } = require('stream');

class Entry extends PassThrough {
  constructor(header, callback) {
    super();
    this.header = header;
    process.nextTick(callback);
  }
}

const createPackStream = () => {
  const output = new PassThrough();

  output.entry = (header, data, callback) => {
    const entry = new Entry(header, callback);
    if (data) {
      entry.end(data);
    }
    entry.pipe(output, { end: false });
    return entry;
  };

  output.finalize = () => {
    output.end();
  };

  return output;
};

const createExtractStream = () => {
  const extractStream = new Writable({ objectMode: true });

  extractStream.entries = [];

  extractStream._write = (entry, encoding, callback) => {
    extractStream.entries.push(entry);
    entry.resume();
    entry.on('end', callback);
  };

  extractStream.on('pipe', (source) => {
    source.unpipe(extractStream);
    for (const entry of source.entries) {
      extractStream.write(entry);
    }
    extractStream.end();
  });

  return extractStream;
};

module.exports = { pack: createPackStream, extract: createExtractStream };

const fs = require('fs');

const packStream = createPackStream();
packStream.entry({ name: 'hello.txt', size: 11 }, 'Hello world', (err) => {
  if (err) throw err;
  packStream.finalize();
});

packStream.pipe(fs.createWriteStream('example.tar'));

const extractStream = createExtractStream();
const sourcePackStream = createPackStream();
sourcePackStream.entry({ name: 'test.txt' }, 'Test content').end();
sourcePackStream.finalize();

sourcePackStream.pipe(extractStream);
extractStream.on('finish', () => {
  console.log('Extracted entries:', extractStream.entries.map(entry => entry.header.name));
});
