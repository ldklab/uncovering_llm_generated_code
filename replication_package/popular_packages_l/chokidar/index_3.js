import { watch } from 'fs';
import { promises as fsPromises } from 'fs';

class FileSystemWatcher {
  constructor(config = {}) {
    this.config = config;
    this.activeWatches = new Map();
    this.eventCallbacks = new Map();
  }

  startWatching(path) {
    if (!this.activeWatches.has(path)) {
      const fsWatcher = watch(path, { recursive: true }, (eventType, filename) => {
        this.processEvent(eventType, filename);
      });
      this.activeWatches.set(path, fsWatcher);
    }
  }

  async processEvent(eventType, filename) {
    const fullPath = `${process.cwd()}/${filename}`;
    try {
      const stats = await fsPromises.stat(fullPath);
      if (eventType === 'rename' && !stats.isFile()) {
        this.triggerEvent('unlink', fullPath);
      } else if (eventType === 'change') {
        this.triggerEvent('change', fullPath, stats);
      }
    } catch {
      this.triggerEvent('unlink', fullPath);
    }
  }

  addPaths(paths) {
    const pathList = Array.isArray(paths) ? paths : [paths];
    pathList.forEach(p => this.startWatching(p));
  }

  on(eventName, callback) {
    if (!this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.set(eventName, []);
    }
    this.eventCallbacks.get(eventName).push(callback);
  }

  triggerEvent(eventName, ...args) {
    if (this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.get(eventName).forEach(callback => callback(...args));
    }
  }

  stopWatching(path) {
    const pathList = Array.isArray(path) ? path : [path];
    pathList.forEach(p => {
      if (this.activeWatches.has(p)) {
        this.activeWatches.get(p).close();
        this.activeWatches.delete(p);
      }
    });
  }

  stopAll() {
    for (const watcher of this.activeWatches.values()) {
      watcher.close();
    }
    this.activeWatches.clear();
  }

  getCurrentWatches() {
    const watches = {};
    this.activeWatches.forEach((watcher, path) => {
      watches[path] = [path];
    });
    return watches;
  }
}

function createWatcher(paths, config) {
  const fileWatcher = new FileSystemWatcher(config);
  fileWatcher.addPaths(paths);
  return fileWatcher;
}

export default createWatcher;

// Usage Example:
const fileWatcher = createWatcher('.', {
  ignored: (path, stats) => stats?.isFile() && !path.endsWith('.js'),
  persistent: true
});

fileWatcher.on('add', path => console.log(`File added: ${path}`));
fileWatcher.on('change', (path, stats) => console.log(`File changed: ${path}, size: ${stats.size}`));
fileWatcher.on('unlink', path => console.log(`File removed: ${path}`));
