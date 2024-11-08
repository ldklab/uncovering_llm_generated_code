const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class Watchpack extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.watchers = new Map();
    this.pendingChanges = new Set();
    this.pendingRemovals = new Set();
    this.aggregateDelay = options.aggregateTimeout || 0;
    this.aggregationTimer = null;
  }

  watch({ files = [], directories = [], missing = [], startTime = Date.now() } = {}) {
    this.close();

    for (const dir of directories) {
      this._addDirectoryWatcher(dir);
    }
  }

  _addDirectoryWatcher(dir) {
    if (!this.watchers.has(dir)) {
      const watcher = fs.watch(dir, (eventType, filename) => {
        if (filename) {
          const filePath = path.join(dir, filename);
          this._handleFileEvent(filePath, eventType);
        }
      });

      this.watchers.set(dir, watcher);
    }
  }

  _handleFileEvent(filePath, eventType) {
    const stats = fs.statSync(filePath);
    const mtime = stats.mtimeMs;

    if (eventType === 'rename' || eventType === 'change') {
      this.pendingChanges.add(filePath);
      this.emit("change", filePath, mtime, `Detected ${eventType}`);
    }

    if (this.aggregateDelay > 0) {
      clearTimeout(this.aggregationTimer);
      this.aggregationTimer = setTimeout(() => {
        this.emit("aggregated", this.pendingChanges, this.pendingRemovals);
        this.pendingChanges.clear();
        this.pendingRemovals.clear();
      }, this.aggregateDelay);
    }
  }

  pause() {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
  }

  close() {
    this.pause();
    this.watchers.clear();
  }

  getAggregated() {
    return { changes: new Set(this.pendingChanges), removals: new Set(this.pendingRemovals) };
  }
}

module.exports = Watchpack;
