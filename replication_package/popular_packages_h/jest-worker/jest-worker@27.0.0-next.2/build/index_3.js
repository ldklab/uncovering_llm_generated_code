'use strict';

const os = require('os');
const Farm = require('./Farm').default;
const WorkerPool = require('./WorkerPool').default;
const messageParent = require('./workers/messageParent').default;

Object.defineProperty(exports, 'messageParent', {
  enumerable: true,
  get: () => messageParent
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function getExposedMethods(workerPath, options) {
  if (!options.exposedMethods) {
    const module = require(workerPath);
    const methodNames = Object.keys(module);
    options.exposedMethods = methodNames.filter(name => typeof module[name] === 'function');

    if (typeof module === 'function') {
      options.exposedMethods.push('default');
    }
  }
  return options.exposedMethods;
}

class Worker {
  constructor(workerPath, options) {
    this._options = { ...options };
    this._ending = false;

    const workerPoolOptions = {
      enableWorkerThreads: options.enableWorkerThreads || false,
      forkOptions: options.forkOptions || {},
      maxRetries: options.maxRetries || 3,
      numWorkers: options.numWorkers || Math.max(os.cpus().length - 1, 1),
      resourceLimits: options.resourceLimits || {},
      setupArgs: options.setupArgs || []
    };

    this._workerPool = this._options.WorkerPool
      ? new this._options.WorkerPool(workerPath, workerPoolOptions)
      : new WorkerPool(workerPath, workerPoolOptions);

    this._farm = new Farm(workerPoolOptions.numWorkers, this._workerPool.send.bind(this._workerPool), this._options.computeWorkerKey);
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
}

exports.Worker = Worker;
