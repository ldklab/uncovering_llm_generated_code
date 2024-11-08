// tar-fs.js
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const tarStream = require('tar-stream');

function pack(directory, options = {}) {
  const packStream = tarStream.pack(options);
  const entrySet = options.entries ? new Set(options.entries) : null;

  function processDirectory(currentDir) {
    const directoryItems = fs.readdirSync(currentDir);
    directoryItems.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const itemStats = fs.statSync(itemPath);

      if (options.ignore && options.ignore(itemPath, { type: itemStats.isDirectory() ? 'directory' : 'file' })) {
        return;
      }

      if (entrySet && !entrySet.has(path.relative(directory, itemPath))) {
        return;
      }

      if (itemStats.isDirectory()) {
        packStream.entry({ name: itemPath, type: 'directory', mode: options.dmode || 0o755 });
        processDirectory(itemPath);
      } else {
        const header = { name: itemPath, size: itemStats.size, mode: options.fmode || 0o644 };
        if (options.map) options.map(header);

        const fileEntry = packStream.entry(header);
        const readStream = fs.createReadStream(itemPath);  
        const processedStream = options.mapStream ? options.mapStream(readStream, header) : readStream;
        processedStream.pipe(fileEntry);
      }
    });
  }

  processDirectory(directory);
  packStream.finalize();
  return packStream;
}

function extract(outputDir, options = {}) {
  const extractionStream = tarStream.extract();
  extractionStream.on('entry', (header, stream, next) => {
    const destinationPath = path.join(outputDir, header.name);

    if (options.ignore && options.ignore(destinationPath, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      fs.mkdirSync(destinationPath, { recursive: true, mode: options.dmode || 0o755 });
      stream.resume();
    } else if (header.type === 'file') {
      const fileWriteStream = fs.createWriteStream(destinationPath, { mode: options.fmode || 0o644 });
      const modifiedStream = options.mapStream ? options.mapStream(stream, header) : stream;
      pipeline(modifiedStream, fileWriteStream, next);
      return;
    } else {
      stream.resume();
    }

    next();
  });

  return extractionStream;
}

module.exports = { pack, extract };
