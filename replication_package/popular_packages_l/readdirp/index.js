import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

class ReaddirpStream extends Readable {
  constructor(root, options = {}) {
    super({ objectMode: true });
    this.root = root;
    this.options = options;
    this._files = [];
    this._dirs = [root];
  }

  _read() {
    if (this._files.length > 0) {
      this.push(this._files.shift());
    } else if (this._dirs.length > 0) {
      const dir = this._dirs.shift();
      fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
        if (err) {
          this.emit('warn', err);
        } else {
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const entryInfo = {
              path: path.relative(this.root, fullPath),
              fullPath,
              basename: entry.name,
              dirent: entry
            };
            if (entry.isFile() && (!this.options.fileFilter || this.options.fileFilter(entryInfo))) {
              this._files.push(entryInfo);
            } else if (entry.isDirectory() && (!this.options.directoryFilter || this.options.directoryFilter(entryInfo))) {
              this._dirs.push(fullPath);
            }
          }
          this._read();
        }
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
  const stream = readdirp(root, options);
  for await (const entry of stream) {
    entries.push(entry);
  }
  return entries;
}

export default readdirp;
export { readdirpPromise };
