const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class DirectoryWalker extends EventEmitter {
  constructor(startPath) {
    super();
    this.startPath = startPath;
    this.filterFunction = null;
  }

  setFilter(filterFunction) {
    this.filterFunction = filterFunction;
    return this;
  }

  start() {
    this.traverse(this.startPath);
    return this;
  }

  traverse(currentPath) {
    fs.readdir(currentPath, { withFileTypes: true }, (error, entries) => {
      if (error) {
        this.emit('error', error, currentPath);
        return;
      }

      entries.forEach(entry => {
        const fullPath = path.join(currentPath, entry.name);
        fs.stat(fullPath, (error, stats) => {
          if (error) {
            this.emit('error', error, fullPath);
            return;
          }

          this.emit('entry', fullPath, stats);

          if (stats.isDirectory()) {
            if (this.filterFunction && !this.filterFunction(fullPath, stats)) {
              return;
            }
            this.emit('directory', fullPath, stats);
            this.traverse(fullPath);
          } else if (stats.isFile()) {
            this.emit('file', fullPath, stats);
          } else if (stats.isSymbolicLink()) {
            this.emit('symlink', fullPath, stats);
          } else if (stats.isBlockDevice()) {
            this.emit('blockDevice', fullPath, stats);
          } else if (stats.isFIFO()) {
            this.emit('fifo', fullPath, stats);
          } else if (stats.isSocket()) {
            this.emit('socket', fullPath, stats);
          } else if (stats.isCharacterDevice()) {
            this.emit('characterDevice', fullPath, stats);
          }
        });
      });

      process.nextTick(() => {
        if (currentPath === this.startPath) {
          this.emit('completed');
        }
      });
    });
  }
}

function createDirectoryWalker(startPath) {
  const walker = new DirectoryWalker(startPath);
  process.nextTick(() => walker.start());
  return walker;
}

module.exports = createDirectoryWalker;
