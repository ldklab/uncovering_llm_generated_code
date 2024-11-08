const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');
const makeError = require('makeerror');

class Walker extends EventEmitter {
  constructor(root) {
    super();
    this._pending = 0;
    this._filterDir = () => true;
    this.go(root);
  }

  static UnknownFileTypeError = makeError(
    'UnknownFileTypeError',
    'The type of this file could not be determined.'
  );

  filterDir(fn) {
    this._filterDir = fn;
    return this;
  }

  go(entry) {
    this._pending++;
    fs.lstat(entry, (er, stat) => {
      if (er) {
        this.emit('error', er, entry, stat);
        this.doneOne();
        return;
      }

      if (stat.isDirectory()) {
        if (!this._filterDir(entry, stat)) {
          this.doneOne();
        } else {
          fs.readdir(entry, (er, files) => {
            if (er) {
              this.emit('error', er, entry, stat);
              this.doneOne();
              return;
            }

            this.emit('entry', entry, stat);
            this.emit('dir', entry, stat);
            files.forEach(part => {
              this.go(path.join(entry, part));
            });
            this.doneOne();
          });
        }
      } else if (stat.isSymbolicLink()) {
        this.handleFileType('symlink', entry, stat);
      } else if (stat.isBlockDevice()) {
        this.handleFileType('blockDevice', entry, stat);
      } else if (stat.isCharacterDevice()) {
        this.handleFileType('characterDevice', entry, stat);
      } else if (stat.isFIFO()) {
        this.handleFileType('fifo', entry, stat);
      } else if (stat.isSocket()) {
        this.handleFileType('socket', entry, stat);
      } else if (stat.isFile()) {
        this.handleFileType('file', entry, stat);
      } else {
        this.emit('error', Walker.UnknownFileTypeError(), entry, stat);
        this.doneOne();
      }
    });
    return this;
  }

  handleFileType(type, entry, stat) {
    this.emit('entry', entry, stat);
    this.emit(type, entry, stat);
    this.doneOne();
  }

  doneOne() {
    if (--this._pending === 0) this.emit('end');
    return this;
  }
}

module.exports = Walker;
