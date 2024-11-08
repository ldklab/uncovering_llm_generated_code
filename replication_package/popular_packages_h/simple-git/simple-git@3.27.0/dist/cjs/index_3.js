"use strict";

// Utility functions
function asArray(source) {
  return Array.isArray(source) ? source : [source];
}

// Custom Error Classes
class GitError extends Error {
  constructor(task, message) {
    super(message);
    this.task = task;
  }
}

// Task Definitions
function commitTask(message, files) {
  const commands = ['commit', ...files, '-m', message];
  return {
    commands,
    parser: parseCommitResult
  };
}

function parseCommitResult(text) {
  // Parsing logic extracted from the original code
  // ...
  return {};  // Return parsed result
}

// Git API
class SimpleGitApi {
  constructor(executor) {
    this._executor = executor;
  }
  
  commit(message, files) {
    return this._runTask(commitTask(message, asArray(files)));
  }

  _runTask(task) {
    // Execute task
    // ...
    return Promise.resolve(); // Return a resolved promise as placeholder
  }
}

// Factory and Runner
function gitInstanceFactory(baseDir, options) {
  const plugins = [];
  return new SimpleGitApi(new GitExecutor(baseDir, plugins));
}

class GitExecutor {
  constructor(baseDir, plugins) {
    this.baseDir = baseDir;
    this.plugins = plugins;
  }
}

// Export Factory
function esModuleFactory(defaultExport) {
  return Object.defineProperties(defaultExport, {
    __esModule: { value: true },
    default: { value: defaultExport }
  });
}

const simpleGit = esModuleFactory(gitInstanceFactory);
module.exports = simpleGit;
