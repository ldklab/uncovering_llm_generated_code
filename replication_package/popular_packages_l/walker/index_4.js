const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class FileSystemWalker extends EventEmitter {
  constructor(startDir) {
    super();
    this.startDir = startDir;
    this.directoryFilter = null;
  }

  setDirectoryFilter(filterFunction) {
    this.directoryFilter = filterFunction;
    return this;
  }

  startWalking() {
    this._recursiveWalk(this.startDir);
    return this;
  }

  _recursiveWalk(currentDir) {
    fs.readdir(currentDir, { withFileTypes: true }, (err, entries) => {
      if (err) {
        this.emit('error', err, currentDir);
        return;
      }

      for (const entry of entries) {
        const entryPath = path.join(currentDir, entry.name);
        fs.stat(entryPath, (err, stats) => {
          if (err) {
            this.emit('error', err, entryPath);
            return;
          }

          this.emit('entry', entryPath, stats);

          if (stats.isDirectory()) {
            if (this.directoryFilter && !this.directoryFilter(entryPath, stats)) return;
            this.emit('directory', entryPath, stats);
            this._recursiveWalk(entryPath);
          } else {
            this.emitByType(entry, entryPath, stats);
          }
        });
      }

      if (currentDir === this.startDir) {
        process.nextTick(() => this.emit('complete'));
      }
    });
  }

  emitByType(entry, entryPath, stats) {
    if (stats.isFile()) {
      this.emit('file', entryPath, stats);
    } else if (stats.isSymbolicLink()) {
      this.emit('symlink', entryPath, stats);
    } else if (stats.isBlockDevice()) {
      this.emit('blockDevice', entryPath, stats);
    } else if (stats.isFIFO()) {
      this.emit('fifo', entryPath, stats);
    } else if (stats.isSocket()) {
      this.emit('socket', entryPath, stats);
    } else if (stats.isCharacterDevice()) {
      this.emit('characterDevice', entryPath, stats);
    }
  }
}

function createFileSystemWalker(startDir) {
  const walker = new FileSystemWalker(startDir);
  process.nextTick(() => walker.startWalking());
  return walker;
}

module.exports = createFileSystemWalker;
