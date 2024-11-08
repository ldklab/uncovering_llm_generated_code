markdown
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const tarStream = require('tar-stream');

function pack(directory, options = {}) {
  const packStream = tarStream.pack(options);
  const requiredEntries = options.entries ? new Set(options.entries) : null;

  function traverseDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const fileStat = fs.statSync(fullPath);

      if (options.ignore && options.ignore(fullPath, { type: fileStat.isDirectory() ? 'directory' : 'file' })) {
        return;
      }

      if (requiredEntries && !requiredEntries.has(path.relative(directory, fullPath))) {
        return;
      }

      if (fileStat.isDirectory()) {
        packStream.entry({ name: fullPath, type: 'directory', mode: options.dmode || 0o755 });
        traverseDir(fullPath);
      } else {
        const header = { name: fullPath, size: fileStat.size, mode: options.fmode || 0o644 };
        if (options.map) options.map(header);

        const entry = packStream.entry(header);
        const fileStream = fs.createReadStream(fullPath);
        const transformedStream = options.mapStream ? options.mapStream(fileStream, header) : fileStream;
        transformedStream.pipe(entry);
      }
    });
  }

  traverseDir(directory);
  packStream.finalize();
  return packStream;
}

function extract(outputDir, options = {}) {
  const extractStream = tarStream.extract();

  extractStream.on('entry', (header, stream, next) => {
    const destination = path.join(outputDir, header.name);

    if (options.ignore && options.ignore(destination, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      fs.mkdirSync(destination, { recursive: true, mode: options.dmode || 0o755 });
      stream.resume();
    } else if (header.type === 'file') {
      const fileOutput = fs.createWriteStream(destination, { mode: options.fmode || 0o644 });
      const transformedStream = options.mapStream ? options.mapStream(stream, header) : stream;
      pipeline(transformedStream, fileOutput, next);
      return;
    } else {
      stream.resume();
    }

    next();
  });

  return extractStream;
}

module.exports = { pack, extract };
