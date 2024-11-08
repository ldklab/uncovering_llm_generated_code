import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

class ReaddirStream extends Readable {
  constructor(rootDir, options = {}) {
    super({ objectMode: true });
    this.rootDir = rootDir;
    this.options = options;
    this.fileQueue = [];
    this.dirQueue = [rootDir];
  }

  _read() {
    if (this.fileQueue.length > 0) {
      this.push(this.fileQueue.shift());
      return;
    } 
      
    if (this.dirQueue.length > 0) {
      const currentDir = this.dirQueue.shift();
      fs.readdir(currentDir, { withFileTypes: true }, (err, dirents) => {
        if (err) {
          this.emit('error', err);
          return;
        }
        dirents.forEach(dirent => {
          const fullPath = path.join(currentDir, dirent.name);
          const entry = {
            path: path.relative(this.rootDir, fullPath),
            fullPath,
            basename: dirent.name,
            dirent,
          };

          if (dirent.isFile()) {
            const shouldIncludeFile = !this.options.fileFilter || this.options.fileFilter(entry);
            if (shouldIncludeFile) this.fileQueue.push(entry);
          } else if (dirent.isDirectory()) {
            const shouldIncludeDir = !this.options.directoryFilter || this.options.directoryFilter(entry);
            if (shouldIncludeDir) this.dirQueue.push(fullPath);
          }
        });

        this._read();
      });
    } else {
      this.push(null);
    }
  }
}

function createReaddirStream(rootDir, options) {
  return new ReaddirStream(rootDir, options);
}

async function readDirectory(rootDir, options) {
  const entries = [];
  const stream = createReaddirStream(rootDir, options);
  for await (const entry of stream) {
    entries.push(entry);
  }
  return entries;
}

export default createReaddirStream;
export { readDirectory };
