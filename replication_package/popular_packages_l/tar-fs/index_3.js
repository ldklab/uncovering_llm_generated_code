// tar-fs-modified.js
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const tarStream = require('tar-stream');

function pack(directory, options = {}) {
  const packer = tarStream.pack(options);
  const entriesSet = options.entries ? new Set(options.entries) : null;

  function addEntries(currentPath) {
    const contents = fs.readdirSync(currentPath);

    contents.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (options.ignore && options.ignore(itemPath, { type: stats.isDirectory() ? 'directory' : 'file' })) {
        return;
      }

      if (entriesSet && !entriesSet.has(path.relative(directory, itemPath))) {
        return;
      }

      if (stats.isDirectory()) {
        packer.entry({ name: itemPath, type: 'directory', mode: options.dmode || 0o755 }, () => {
          addEntries(itemPath);
        });
      } else {
        const header = { name: itemPath, size: stats.size, mode: options.fmode || 0o644 };
        if (options.map) options.map(header);

        const entry = packer.entry(header);
        const sourceStream = fs.createReadStream(itemPath);
        const processedStream = options.mapStream ? options.mapStream(sourceStream, header) : sourceStream;
        processedStream.pipe(entry);
      }
    });
  }

  addEntries(directory);
  packer.finalize();
  return packer;
}

function extract(outputDir, options = {}) {
  const extractor = tarStream.extract();

  extractor.on('entry', (header, stream, next) => {
    const destinationPath = path.join(outputDir, header.name);

    if (options.ignore && options.ignore(destinationPath, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      fs.mkdirSync(destinationPath, { recursive: true, mode: options.dmode || 0o755 });
      stream.resume();
    } else if (header.type === 'file') {
      const fileStream = fs.createWriteStream(destinationPath, { mode: options.fmode || 0o644 });
      const transformedStream = options.mapStream ? options.mapStream(stream, header) : stream;
      pipeline(transformedStream, fileStream, next);
      return;
    } else {
      stream.resume();
    }

    next();
  });

  return extractor;
}

module.exports = { pack, extract };
