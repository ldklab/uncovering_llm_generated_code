import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

class ReaddirpStream extends Readable {
  constructor(root, options = {}) {
    super({ objectMode: true });
    this.root = root;
    this.options = options;
    this.fileQueue = [];
    this.directoryQueue = [root];
  }

  _read() {
    if (this.fileQueue.length > 0) {
      return this.push(this.fileQueue.shift());
    }

    if (this.directoryQueue.length > 0) {
      const currentDir = this.directoryQueue.shift();
      fs.readdir(currentDir, { withFileTypes: true }, (error, items) => {
        if (error) {
          this.emit('warn', error);
          return this._read();
        }

        items.forEach(item => {
          const itemFullPath = path.join(currentDir, item.name);
          const entryDetail = {
            path: path.relative(this.root, itemFullPath),
            fullPath: itemFullPath,
            basename: item.name,
            dirent: item
          };

          if (item.isFile() && (!this.options.fileFilter || this.options.fileFilter(entryDetail))) {
            this.fileQueue.push(entryDetail);
          } else if (item.isDirectory() && (!this.options.directoryFilter || this.options.directoryFilter(entryDetail))) {
            this.directoryQueue.push(itemFullPath);
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
