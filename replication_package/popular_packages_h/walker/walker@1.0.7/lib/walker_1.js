const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');
const makeError = require('makeerror');

class Walker extends EventEmitter {
  constructor(root) {
    super();
    this._pending = 0;
    this._filterDir = () => true;
    this.startWalking(root);
  }

  // Custom error for unknown file types
  static UnknownFileTypeError = makeError(
    'UnknownFileTypeError',
    'The type of this file could not be determined.'
  );

  // Sets the directory filtering function
  filterDir(fn) {
    this._filterDir = fn;
    return this;
  }

  // Initiates processing of a directory or file
  startWalking(entry) {
    this._pending++;
    fs.lstat(entry, (err, stat) => {
      if (err) {
        this.emit('error', err, entry, stat);
        this.decrementPending();
        return;
      }

      const handleEntry = () => {
        this.emit('entry', entry, stat);
        if (stat.isDirectory()) {
          this.handleDirectory(entry, stat);
        } else if (stat.isSymbolicLink()) {
          this.emit('symlink', entry, stat);
        } else if (stat.isBlockDevice()) {
          this.emit('blockDevice', entry, stat);
        } else if (stat.isCharacterDevice()) {
          this.emit('characterDevice', entry, stat);
        } else if (stat.isFIFO()) {
          this.emit('fifo', entry, stat);
        } else if (stat.isSocket()) {
          this.emit('socket', entry, stat);
        } else if (stat.isFile()) {
          this.emit('file', entry, stat);
        } else {
          this.emit('error', Walker.UnknownFileTypeError(), entry, stat);
        }
        this.decrementPending();
      };

      handleEntry();
    });
    return this;
  }

  // Handles directory entries
  handleDirectory(entry, stat) {
    if (!this._filterDir(entry, stat)) {
      this.decrementPending();
      return;
    }

    fs.readdir(entry, (err, files) => {
      if (err) {
        this.emit('error', err, entry, stat);
        this.decrementPending();
        return;
      }

      this.emit('dir', entry, stat);
      files.forEach(part => this.startWalking(path.join(entry, part)));
      this.decrementPending();
    });
  }

  // Decrements pending operations and checks for completion
  decrementPending() {
    if (--this._pending === 0) this.emit('end');
    return this;
  }
}

module.exports = Walker;
