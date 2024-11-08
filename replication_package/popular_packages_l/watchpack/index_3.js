const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class Watchpack extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.watchers = new Map();
    this.aggregatedChanges = new Set();
    this.aggregatedRemovals = new Set();
    this.aggregateTimeout = options.aggregateTimeout || 0;
    this.aggregationTimer = null;
  }

  watch({ files = [], directories = [], missing = [], startTime = Date.now() } = {}) {
    this.close();
    directories.forEach(dir => this._watchDirectory(dir));
  }

  _watchDirectory(dir) {
    if (!this.watchers.has(dir)) {
      const watcher = fs.watch(dir, (eventType, filename) => {
        if (filename) {
          this._notifyChange(path.join(dir, filename), eventType);
        }
      });
      this.watchers.set(dir, watcher);
    }
  }

  _notifyChange(filePath, eventType) {
    const stats = fs.statSync(filePath);
    const mtime = stats.mtimeMs;
    
    if (eventType === 'rename' || eventType === 'change') {
      this.aggregatedChanges.add(filePath);
      this.emit("change", filePath, mtime, `Detected ${eventType}`);
    }

    if (this.aggregateTimeout) {
      clearTimeout(this.aggregationTimer);
      this.aggregationTimer = setTimeout(() => {
        this.emit("aggregated", this.aggregatedChanges, this.aggregatedRemovals);
        this.aggregatedChanges.clear();
        this.aggregatedRemovals.clear();
      }, this.aggregateTimeout);
    }
  }

  pause() {
    this.watchers.forEach(watcher => watcher.close());
  }

  close() {
    this.pause();
    this.watchers.clear();
  }

  getAggregated() {
    return {
      changes: new Set(this.aggregatedChanges),
      removals: new Set(this.aggregatedRemovals)
    };
  }
}

module.exports = Watchpack;
