const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class Walker extends EventEmitter {
  constructor(root) {
    super();
    this.root = root;
    this.dirFilter = null;
  }

  filterDir(filterFn) {
    this.dirFilter = filterFn;
    return this;
  }

  walk() {
    this._walk(this.root);
    return this;
  }

  _walk(dir) {
    fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
      if (err) {
        this.emit('error', err, dir);
        return;
      }

      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        fs.stat(fullPath, (err, stat) => {
          if (err) {
            this.emit('error', err, fullPath);
            return;
          }

          this.emit('entry', fullPath, stat);

          if (stat.isDirectory()) {
            if (this.dirFilter && !this.dirFilter(fullPath, stat)) {
              return;
            }
            this.emit('dir', fullPath, stat);
            this._walk(fullPath);
          } else if (stat.isFile()) {
            this.emit('file', fullPath, stat);
          } else if (stat.isSymbolicLink()) {
            this.emit('symlink', fullPath, stat);
          } else if (stat.isBlockDevice()) {
            this.emit('blockDevice', fullPath, stat);
          } else if (stat.isFIFO()) {
            this.emit('fifo', fullPath, stat);
          } else if (stat.isSocket()) {
            this.emit('socket', fullPath, stat);
          } else if (stat.isCharacterDevice()) {
            this.emit('characterDevice', fullPath, stat);
          }
        });
      });

      process.nextTick(() => {
        if (dir === this.root) {
          this.emit('end');
        }
      });
    });
  }
}

function WalkerFactory(root) {
  const walkerInstance = new Walker(root);
  process.nextTick(() => walkerInstance.walk());
  return walkerInstance;
}

module.exports = WalkerFactory;
