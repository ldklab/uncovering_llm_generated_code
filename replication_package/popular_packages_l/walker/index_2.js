const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class DirectoryWalker extends EventEmitter {
  constructor(basePath) {
    super();
    this.basePath = basePath;
    this.directoryFilter = null;
  }

  filterDirectories(filterFunction) {
    this.directoryFilter = filterFunction;
    return this;
  }

  startWalking() {
    this._explore(this.basePath);
    return this;
  }

  _explore(directory) {
    fs.readdir(directory, { withFileTypes: true }, (error, items) => {
      if (error) {
        this.emit('error', error, directory);
        return;
      }

      items.forEach(item => {
        const absolutePath = path.join(directory, item.name);
        fs.stat(absolutePath, (error, stats) => {
          if (error) {
            this.emit('error', error, absolutePath);
            return;
          }

          this.emit('entry', absolutePath, stats);

          if (stats.isDirectory()) {
            if (this.directoryFilter && !this.directoryFilter(absolutePath, stats)) {
              return;
            }
            this.emit('directory', absolutePath, stats);
            this._explore(absolutePath);
          } else if (stats.isFile()) {
            this.emit('file', absolutePath, stats);
          } else if (stats.isSymbolicLink()) {
            this.emit('symbolicLink', absolutePath, stats);
          } else if (stats.isBlockDevice()) {
            this.emit('blockDevice', absolutePath, stats);
          } else if (stats.isFIFO()) {
            this.emit('fifo', absolutePath, stats);
          } else if (stats.isSocket()) {
            this.emit('socket', absolutePath, stats);
          } else if (stats.isCharacterDevice()) {
            this.emit('characterDevice', absolutePath, stats);
          }
        });
      });

      process.nextTick(() => {
        if (directory === this.basePath) {
          this.emit('completion');
        }
      });
    });
  }
}

function createWalker(basePath) {
  const walkerInstance = new DirectoryWalker(basePath);
  process.nextTick(() => walkerInstance.startWalking());
  return walkerInstance;
}

module.exports = createWalker;
