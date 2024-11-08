// tar-fs-rewrite.js
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const tarStream = require('tar-stream');

function pack(directory, options = {}) {
  const packStream = tarStream.pack(options);
  const specifiedEntries = options.entries ? new Set(options.entries) : null;

  function traverseDir(currentDir) {
    const contents = fs.readdirSync(currentDir);
    contents.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const itemStats = fs.statSync(itemPath);

      if (options.ignore && options.ignore(itemPath, { type: itemStats.isDirectory() ? 'directory' : 'file' })) {
        return;
      }

      if (specifiedEntries && !specifiedEntries.has(path.relative(directory, itemPath))) {
        return;
      }

      if (itemStats.isDirectory()) {
        packStream.entry({ name: itemPath, type: 'directory', mode: options.dmode || 0o755 });
        traverseDir(itemPath);
      } else {
        const fileHeader = { name: itemPath, size: itemStats.size, mode: options.fmode || 0o644 };
        if (options.map) options.map(fileHeader);

        const fileEntry = packStream.entry(fileHeader);
        const fileStream = fs.createReadStream(itemPath);
        const modifiedStream = options.mapStream ? options.mapStream(fileStream, fileHeader) : fileStream;
        modifiedStream.pipe(fileEntry);
      }
    });
  }

  traverseDir(directory);
  packStream.finalize();
  return packStream;
}

function extract(outputDir, options = {}) {
  const extractStream = tarStream.extract();
  extractStream.on('entry', (header, entryStream, nextAction) => {
    const destinationPath = path.join(outputDir, header.name);

    if (options.ignore && options.ignore(destinationPath, header)) {
      entryStream.resume();
      return nextAction();
    }

    if (header.type === 'directory') {
      fs.mkdirSync(destinationPath, { recursive: true, mode: options.dmode || 0o755 });
      entryStream.resume();
    } else if (header.type === 'file') {
      const outputStream = fs.createWriteStream(destinationPath, { mode: options.fmode || 0o644 });
      const modifiedEntryStream = options.mapStream ? options.mapStream(entryStream, header) : entryStream;
      pipeline(modifiedEntryStream, outputStream, nextAction);
      return;
    } else {
      entryStream.resume();
    }

    nextAction();
  });

  return extractStream;
}

module.exports = { pack, extract };
