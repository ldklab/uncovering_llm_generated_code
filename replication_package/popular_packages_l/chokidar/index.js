import { watch, stat } from 'fs';
import { promises as fsPromises } from 'fs';

class FSWatcher {
  constructor(options) {
    this.options = options || {};
    this.watchedPaths = new Map();
    this.listeners = new Map();
  }

  watchPath(path) {
    if (!this.watchedPaths.has(path)) {
      const watcher = watch(path, { recursive: true }, (eventType, filename) => {
        this.handleEvent(eventType, filename);
      });

      this.watchedPaths.set(path, watcher);
    }
  }

  async handleEvent(eventType, filename) {
    const path = `${process.cwd()}/${filename}`;
    try {
      const stats = await fsPromises.stat(path);
      if (eventType === 'rename' && !stats.isFile()) {
        this.emit('unlink', path);
      } else if (eventType === 'change') {
        this.emit('change', path, stats);
      }
    } catch {
      this.emit('unlink', path);
    }
  }

  add(path) {
    const paths = Array.isArray(path) ? path : [path];
    for (const singlePath of paths) {
      this.watchPath(singlePath);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        callback(...args);
      }
    }
  }

  unwatch(path) {
    const paths = Array.isArray(path) ? path : [path];
    for (const singlePath of paths) {
      if (this.watchedPaths.has(singlePath)) {
        this.watchedPaths.get(singlePath).close();
        this.watchedPaths.delete(singlePath);
      }
    }
  }

  close() {
    for (const [path, watcher] of this.watchedPaths) {
      watcher.close();
    }
    this.watchedPaths.clear();
  }

  getWatched() {
    const watched = {};
    this.watchedPaths.forEach((watcher, path) => {
      watched[path] = [ path ];
    });
    return watched;
  }
}

function chokidarWatch(paths, options) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}

export default chokidarWatch;

// How to use:
const watcher = chokidarWatch('.', {
  ignored: (path, stats) => stats?.isFile() && !path.endsWith('.js'),
  persistent: true
});

watcher.on('add', path => console.log(`File ${path} has been added`));
watcher.on('change', (path, stats) => console.log(`File ${path} changed size to ${stats.size}`));
watcher.on('unlink', path => console.log(`File ${path} has been removed`));
