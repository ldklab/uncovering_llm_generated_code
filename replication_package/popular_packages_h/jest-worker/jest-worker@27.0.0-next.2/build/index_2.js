'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'messageParent', {
  enumerable: true,
  get: function () {
    return messageParentFunc.default;
  }
});
exports.Worker = void 0;

const os = require('os');
const Farm = require('./Farm').default;
const WorkerPool = require('./WorkerPool').default;
const messageParentFunc = require('./workers/messageParent').default;

function getExposedMethods(modulePath, options) {
  let { exposedMethods } = options;
  
  if (!exposedMethods) {
    const module = require(modulePath);
    exposedMethods = Object.keys(module).filter(
      name => typeof module[name] === 'function'
    );

    if (typeof module === 'function') {
      exposedMethods.push('default');
    }
  }

  return exposedMethods;
}

class Worker {
  constructor(modulePath, options) {
    const { 
      enableWorkerThreads = false, 
      forkOptions = {}, 
      maxRetries = 3, 
      numWorkers = Math.max(os.cpus().length - 1, 1), 
      resourceLimits = {}, 
      setupArgs = [] 
    } = options;

    this._options = { ...options, enableWorkerThreads, forkOptions, maxRetries, numWorkers, resourceLimits, setupArgs };
    this._ending = false;

    const workerPoolInstance = options.WorkerPool 
      ? new options.WorkerPool(modulePath, this._options) 
      : new WorkerPool(modulePath, this._options);

    this._workerPool = workerPoolInstance;
    this._farm = new Farm(workerPoolInstance, this._options.computeWorkerKey);

    this._bindExposedWorkerMethods(modulePath, this._options);
  }

  _bindExposedWorkerMethods(modulePath, options) {
    getExposedMethods(modulePath, options).forEach(name => {
      if (!name.startsWith('_') && !this.constructor.prototype.hasOwnProperty(name)) {
        this[name] = this._callFunctionWithArgs.bind(this, name);
      }
    });
  }

  _callFunctionWithArgs(method, ...args) {
    if (this._ending) {
      throw new Error('Cannot perform action: worker pool has ended.');
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
      throw new Error('Cannot perform action: worker pool has ended.');
    }

    this._ending = true;
    return this._workerPool.end();
  }
}

exports.Worker = Worker;
