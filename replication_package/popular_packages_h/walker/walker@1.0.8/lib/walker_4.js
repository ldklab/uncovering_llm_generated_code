const fs = require('fs');
const path = require('path');
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

    fs.lstat(entry, (err, stat) => {
      if (err) {
        this.emit('error', err, entry, stat);
        this.doneOne();
        return;
      }

      this.emit('entry', entry, stat);

      if (stat.isDirectory()) {
        if (!this._filterDir(entry, stat)) {
          this.doneOne();
          return;
        }

        this.emit('dir', entry, stat);
        
        fs.readdir(entry, (err, files) => {
          if (err) {
            this.emit('error', err, entry, stat);
            this.doneOne();
            return;
          }

          files.forEach((part) => this.go(path.join(entry, part)));
          this.doneOne();
        });

      } else if (stat.isSymbolicLink()) {
        this.emit('symlink', entry, stat);
        this.doneOne();

      } else if (stat.isBlockDevice()) {
        this.emit('blockDevice', entry, stat);
        this.doneOne();

      } else if (stat.isCharacterDevice()) {
        this.emit('characterDevice', entry, stat);
        this.doneOne();

      } else if (stat.isFIFO()) {
        this.emit('fifo', entry, stat);
        this.doneOne();

      } else if (stat.isSocket()) {
        this.emit('socket', entry, stat);
        this.doneOne();

      } else if (stat.isFile()) {
        this.emit('file', entry, stat);
        this.doneOne();

      } else {
        this.emit('error', Walker.UnknownFileTypeError(), entry, stat);
        this.doneOne();
      }
    });
    return this;
  }
  
  doneOne() {
    if (--this._pending === 0) this.emit('end');
    return this;
  }
}

module.exports = Walker;
