// fast-glob.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const micromatch = require('micromatch');
const { Readable } = require('stream');

const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);

class FastGlob {
  
  static async globAsync(patterns, options = {}) {
    const tasks = FastGlob.generateTasks(patterns, options);
    let result = [];

    for (const task of tasks) {
      result = result.concat(await FastGlob.processTaskAsync(task, options));
    }

    return options.unique ? [...new Set(result)] : result;
  }

  static globSync(patterns, options = {}) {
    const tasks = FastGlob.generateTasks(patterns, options);
    let result = [];

    for (const task of tasks) {
      result = result.concat(FastGlob.processTaskSync(task, options));
    }

    return options.unique ? [...new Set(result)] : result;
  }

  static globStream(patterns, options = {}) {
    const tasks = FastGlob.generateTasks(patterns, options);
    const stream = new Readable({ objectMode: options.objectMode });

    (async () => {
      for (const task of tasks) {
        for await (const entry of FastGlob.streamProcessTask(task, options)) {
          stream.push(entry);
        }
      }
      stream.push(null);
    })();

    return stream;
  }

  static async processTaskAsync(task, options) {
    const entries = await readdir(task.base, { withFileTypes: true });
    let results = [];

    for (const entry of entries) {
      const entryPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        const matched = micromatch.isMatch(entryPath, task.patterns);

        if (matched) {
          results.push(this.getEntry(entry, entryPath, options));
          if (entry.isDirectory() && options.deep !== 0) {
            const subOptions = { ...options, cwd: entryPath, deep: options.deep - 1 };
            results = results.concat(await this.globAsync('**', subOptions));
          }
        }
      }
    }

    return results;
  }

  static processTaskSync(task, options) {
    const entries = fs.readdirSync(task.base, { withFileTypes: true });
    let results = [];

    for (const entry of entries) {
      const entryPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        const matched = micromatch.isMatch(entryPath, task.patterns);

        if (matched) {
          results.push(this.getEntry(entry, entryPath, options));
          if (entry.isDirectory() && options.deep !== 0) {
            const subOptions = { ...options, cwd: entryPath, deep: options.deep - 1 };
            results = results.concat(this.globSync('**', subOptions));
          }
        }
      }
    }

    return results;
  }

  static async* streamProcessTask(task, options) {
    const entries = await readdir(task.base, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        const matched = micromatch.isMatch(entryPath, task.patterns);

        if (matched) {
          yield this.getEntry(entry, entryPath, options);

          if (entry.isDirectory() && options.deep !== 0) {
            const subOptions = { ...options, cwd: entryPath, deep: options.deep - 1 };
            yield* this.globStream('**', subOptions);
          }
        }
      }
    }
  }

  static generateTasks(patterns, options) {
    const tasks = [];

    const base = options.cwd || process.cwd();
    for (const pattern of [].concat(patterns)) {
      const isDynamic = FastGlob.isDynamicPattern(pattern, options);
      tasks.push({
        base,
        dynamic: isDynamic,
        patterns: [].concat(pattern),
      });
    }

    return tasks;
  }

  static isDynamicPattern(pattern, options = {}) {
    return micromatch.isMatch(pattern, '*');
  }

  static escapePath(p) {
    return p.replace(/([!*?|()[\]{}])/g, '\\$1');
  }

  static convertPathToPattern(p) {
    return this.escapePath(p).replace(/\\/g, '/');
  }

  static getEntry(dirent, entryPath, options) {
    if (options.objectMode || options.stats) {
      const stats = options.stats ? fs.statSync(entryPath) : undefined;
      return { name: dirent.name, path: entryPath, dirent, stats };
    }
    return entryPath;
  }
}

module.exports = {
  fg: FastGlob.globAsync,
  async: FastGlob.globAsync,
  glob: FastGlob.globAsync,
  sync: FastGlob.globSync,
  globSync: FastGlob.globSync,
  stream: FastGlob.globStream,
  globStream: FastGlob.globStream,
  generateTasks: FastGlob.generateTasks,
  isDynamicPattern: FastGlob.isDynamicPattern,
  escapePath: FastGlob.escapePath,
  convertPathToPattern: FastGlob.convertPathToPattern,
};
