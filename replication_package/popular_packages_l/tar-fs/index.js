markdown
// tar-fs.js
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const tarStream = require('tar-stream');

function pack(directory, options = {}) {
  const pack = tarStream.pack(options);
  const entries = options.entries ? new Set(options.entries) : null;

  function recurseDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (options.ignore && options.ignore(fullPath, { type: stat.isDirectory() ? 'directory' : 'file' })) {
        return;
      }

      // Check entries if specified
      if (entries && !entries.has(path.relative(directory, fullPath))) {
        return;
      }

      if (stat.isDirectory()) {
        pack.entry({ name: fullPath, type: 'directory', mode: options.dmode || 0o755 });
        recurseDirectory(fullPath);
      } else {
        const entryHeader = { name: fullPath, size: stat.size, mode: options.fmode || 0o644 };
        if (options.map) options.map(entryHeader);

        const entry = pack.entry(entryHeader);
        const stream = fs.createReadStream(fullPath);  
        const mapStream = options.mapStream ? options.mapStream(stream, entryHeader) : stream;
        mapStream.pipe(entry);
      }
    });
  }

  recurseDirectory(directory);
  pack.finalize();
  return pack;
}

function extract(outputDir, options = {}) {
  const extract = tarStream.extract();
  extract.on('entry', (header, stream, next) => {
    const outPath = path.join(outputDir, header.name);

    if (options.ignore && options.ignore(outPath, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      fs.mkdirSync(outPath, { recursive: true, mode: options.dmode || 0o755 });
      stream.resume();
    } else if (header.type === 'file') {
      const out = fs.createWriteStream(outPath, { mode: options.fmode || 0o644 });
      const mapStream = options.mapStream ? options.mapStream(stream, header) : stream;
      pipeline(mapStream, out, next);
      return;
    } else {
      stream.resume();
    }

    next();
  });

  return extract;
}

module.exports = { pack, extract };
