'use strict';

const os = require('os');
const Farm = require('./Farm').default;
const WorkerPool = require('./WorkerPool').default;
const messageParent = require('./workers/messageParent').default;

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.messageParent = messageParent;
exports.Worker = class Worker {
  constructor(workerPath, options) {
    this._options = {...options};
    this._ending = false;

    const workerPoolOptions = {
      enableWorkerThreads: this._options.enableWorkerThreads || false,
      forkOptions: this._options.forkOptions || {},
      maxRetries: this._options.maxRetries || 3,
      numWorkers: this._options.numWorkers || Math.max(os.cpus().length - 1, 1),
      resourceLimits: this._options.resourceLimits || {},
      setupArgs: this._options.setupArgs || []
    };

    this._workerPool = this._options.WorkerPool 
      ? new this._options.WorkerPool(workerPath, workerPoolOptions)
      : new WorkerPool(workerPath, workerPoolOptions);

    this._farm = new Farm(
      workerPoolOptions.numWorkers,
      this._workerPool.send.bind(this._workerPool),
      this._options.computeWorkerKey
    );

    this._bindExposedWorkerMethods(workerPath, this._options);
  }

  _bindExposedWorkerMethods(workerPath, options) {
    getExposedMethods(workerPath, options).forEach(name => {
      if (!name.startsWith('_') && !this.constructor.prototype.hasOwnProperty(name)) {
        this[name] = this._callFunctionWithArgs.bind(this, name);
      }
    });
  }

  _callFunctionWithArgs(method, ...args) {
    if (this._ending) {
      throw new Error('Farm is ended, no more calls can be done to it');
    }
    return this._farm.doWork(method, ...args);
  }

  getStderr() {
    return this._workerPool.getStderr();
  }

  getStdout() {
    return this._workerPool.getStdout();
  }

  async end() {
    if (this._ending) {
      throw new Error('Farm is ended, no more calls can be done to it');
    }
    this._ending = true;
    return this._workerPool.end();
  }
};

function getExposedMethods(workerPath, options) {
  let exposedMethods = options.exposedMethods;

  if (!exposedMethods) {
    const module = require(workerPath);
    exposedMethods = Object.keys(module).filter(name => typeof module[name] === 'function');
    if (typeof module === 'function') {
      exposedMethods.push('default');
    }
  }

  return exposedMethods;
}
