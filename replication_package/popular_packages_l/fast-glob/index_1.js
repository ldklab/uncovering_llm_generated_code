const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const micromatch = require('micromatch');
const { Readable } = require('stream');

const readdir = promisify(fs.readdir);

class FastGlob {

  static async globAsync(patterns, options = {}) {
    const tasks = FastGlob.createTasks(patterns, options);
    let results = [];

    for (const task of tasks) {
      results = results.concat(await FastGlob.handleAsyncTask(task, options));
    }

    return options.unique ? [...new Set(results)] : results;
  }

  static globSync(patterns, options = {}) {
    const tasks = FastGlob.createTasks(patterns, options);
    let results = [];

    for (const task of tasks) {
      results = results.concat(FastGlob.handleSyncTask(task, options));
    }

    return options.unique ? [...new Set(results)] : results;
  }

  static globStream(patterns, options = {}) {
    const tasks = FastGlob.createTasks(patterns, options);
    const stream = new Readable({ objectMode: options.objectMode });

    (async () => {
      for (const task of tasks) {
        for await (const entry of FastGlob.handleStreamTask(task, options)) {
          stream.push(entry);
        }
      }
      stream.push(null);
    })();

    return stream;
  }

  static async handleAsyncTask(task, options) {
    const entries = await readdir(task.base, { withFileTypes: true });
    let output = [];

    for (const entry of entries) {
      const fullPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        if (micromatch.isMatch(fullPath, task.patterns)) {
          output.push(this.formatEntry(entry, fullPath, options));
          if (entry.isDirectory() && options.deep !== 0) {
            const deepOptions = { ...options, cwd: fullPath, deep: options.deep - 1 };
            output = output.concat(await this.globAsync('**', deepOptions));
          }
        }
      }
    }

    return output;
  }

  static handleSyncTask(task, options) {
    const entries = fs.readdirSync(task.base, { withFileTypes: true });
    let output = [];

    for (const entry of entries) {
      const fullPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        if (micromatch.isMatch(fullPath, task.patterns)) {
          output.push(this.formatEntry(entry, fullPath, options));
          if (entry.isDirectory() && options.deep !== 0) {
            const deepOptions = { ...options, cwd: fullPath, deep: options.deep - 1 };
            output = output.concat(this.globSync('**', deepOptions));
          }
        }
      }
    }

    return output;
  }

  static async* handleStreamTask(task, options) {
    const entries = await readdir(task.base, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(task.base, entry.name);

      if (task.dynamic) {
        if (micromatch.isMatch(fullPath, task.patterns)) {
          yield this.formatEntry(entry, fullPath, options);

          if (entry.isDirectory() && options.deep !== 0) {
            const deepOptions = { ...options, cwd: fullPath, deep: options.deep - 1 };
            yield* this.globStream('**', deepOptions);
          }
        }
      }
    }
  }

  static createTasks(patterns, options) {
    const tasks = [];
    const baseDir = options.cwd || process.cwd();

    for (const pattern of Array.isArray(patterns) ? patterns : [patterns]) {
      const isDynamic = micromatch.isMatch(pattern, '*');
      tasks.push({ base: baseDir, dynamic: isDynamic, patterns: Array.isArray(pattern) ? pattern : [pattern] });
    }

    return tasks;
  }

  static formatEntry(dirent, pathname, options) {
    return options.objectMode || options.stats ? 
      { name: dirent.name, path: pathname, dirent, ...(options.stats && { stats: fs.statSync(pathname) }) } : 
      pathname;
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
  generateTasks: FastGlob.createTasks,
};
