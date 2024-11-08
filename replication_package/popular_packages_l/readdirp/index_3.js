import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

class ReaddirpStream extends Readable {
  constructor(root, options = {}) {
    super({ objectMode: true });
    this.root = root;
    this.options = options;
    this._directories = [root];
    this._files = [];
  }

  _read() {
    if (this._files.length > 0) {
      this.push(this._files.shift());
      return;
    }

    if (this._directories.length > 0) {
      const currentDir = this._directories.shift();
      fs.readdir(currentDir, { withFileTypes: true }, (err, items) => {
        if (err) {
          this.emit('warn', err);
          return;
        }

        items.forEach((item) => {
          const fullPath = path.join(currentDir, item.name);
          const relativePath = path.relative(this.root, fullPath);
          const entryInfo = {
            path: relativePath,
            fullPath,
            basename: item.name,
            dirent: item,
          };

          if (item.isFile() && (!this.options.fileFilter || this.options.fileFilter(entryInfo))) {
            this._files.push(entryInfo);
          } else if (item.isDirectory() && (!this.options.directoryFilter || this.options.directoryFilter(entryInfo))) {
            this._directories.push(fullPath);
          }
        });

        this._read();
      });
    } else {
      this.push(null);
    }
  }
}

function readdirp(root, options) {
  return new ReaddirpStream(root, options);
}

async function readdirpPromise(root, options) {
  const entries = [];
  for await (const entry of readdirp(root, options)) {
    entries.push(entry);
  }
  return entries;
}

export default readdirp;
export { readdirpPromise };
