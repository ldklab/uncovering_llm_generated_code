const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class DirectoryWalker extends EventEmitter {
  constructor(baseDirectory) {
    super();
    this.baseDirectory = baseDirectory;
    this.directoryFilter = null;
  }

  setDirectoryFilter(filterFunction) {
    this.directoryFilter = filterFunction;
    return this;
  }

  startWalking() {
    this._recurseDirectory(this.baseDirectory);
    return this;
  }

  _recurseDirectory(currentDirectory) {
    fs.readdir(currentDirectory, { withFileTypes: true }, (err, directoryEntries) => {
      if (err) {
        this.emit('error', err, currentDirectory);
        return;
      }

      directoryEntries.forEach(entry => {
        const fullPath = path.join(currentDirectory, entry.name);
        fs.stat(fullPath, (err, stats) => {
          if (err) {
            this.emit('error', err, fullPath);
            return;
          }

          this.emit('entryFound', fullPath, stats);

          if (stats.isDirectory()) {
            if (this.directoryFilter && !this.directoryFilter(fullPath, stats)) {
              return;
            }
            this.emit('directoryFound', fullPath, stats);
            this._recurseDirectory(fullPath);
          } else if (stats.isFile()) {
            this.emit('fileFound', fullPath, stats);
          } else if (stats.isSymbolicLink()) {
            this.emit('symlinkFound', fullPath, stats);
          } else if (stats.isBlockDevice()) {
            this.emit('blockDeviceFound', fullPath, stats);
          } else if (stats.isFIFO()) {
            this.emit('fifoFound', fullPath, stats);
          } else if (stats.isSocket()) {
            this.emit('socketFound', fullPath, stats);
          } else if (stats.isCharacterDevice()) {
            this.emit('characterDeviceFound', fullPath, stats);
          }
        });
      });

      process.nextTick(() => {
        if (currentDirectory === this.baseDirectory) {
          this.emit('walkComplete');
        }
      });
    });
  }
}

function createDirectoryWalker(baseDirectory) {
  const walkerInstance = new DirectoryWalker(baseDirectory);
  process.nextTick(() => walkerInstance.startWalking());
  return walkerInstance;
}

module.exports = createDirectoryWalker;
