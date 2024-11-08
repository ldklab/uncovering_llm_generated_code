'use strict';

const {default: Farm} = require('./Farm');
const {default: WorkerPool} = require('./WorkerPool');
const {default: PriorityQueue} = require('./PriorityQueue');
const {default: FifoQueue} = require('./FifoQueue');
const {default: messageParent} = require('./workers/messageParent');
const os = require('os');
const path = require('path');
const url = require('url');

exports.FifoQueue = FifoQueue;
exports.PriorityQueue = PriorityQueue;
exports.messageParent = messageParent;
exports.Worker = class Worker {
  _ending = false;
  _farm;
  _options;
  _workerPool;

  constructor(workerPath, options) {
    this._options = {...options}; 
    workerPath = this._resolveWorkerPath(workerPath);
    const workerPoolOptions = this._generateWorkerPoolOptions();
    this._workerPool = this._initializeWorkerPool(workerPath, workerPoolOptions);
    this._farm = new Farm(workerPoolOptions.numWorkers, this._workerPool.send.bind(this._workerPool), {
      computeWorkerKey: this._options.computeWorkerKey,
      taskQueue: this._options.taskQueue,
      workerSchedulingPolicy: this._options.workerSchedulingPolicy
    });
    this._bindExposedWorkerMethods(workerPath, this._options);
  }

  _resolveWorkerPath(workerPath) {
    if (typeof workerPath !== 'string') workerPath = workerPath.href;
    if (workerPath.startsWith('file:')) {
      return url.fileURLToPath(workerPath);
    } else if (!path.isAbsolute(workerPath)) {
      throw new Error(`'workerPath' must be absolute, got '${workerPath}'`);
    }
    return workerPath;
  }
  
  _generateWorkerPoolOptions() {
    return {
      enableWorkerThreads: this._options.enableWorkerThreads ?? false,
      forkOptions: this._options.forkOptions ?? {},
      idleMemoryLimit: this._options.idleMemoryLimit,
      maxRetries: this._options.maxRetries ?? 3,
      numWorkers: this._options.numWorkers ?? Math.max(this._getNumberOfCpus() - 1, 1),
      resourceLimits: this._options.resourceLimits ?? {},
      setupArgs: this._options.setupArgs ?? []
    };
  }

  _initializeWorkerPool(workerPath, workerPoolOptions) {
    if (this._options.WorkerPool) {
      return new this._options.WorkerPool(workerPath, workerPoolOptions);
    }
    return new WorkerPool(workerPath, workerPoolOptions);
  }

  _bindExposedWorkerMethods(workerPath, options) {
    this._getExposedMethods(workerPath, options).forEach(name => {
      if (name.startsWith('_') || this.constructor.prototype.hasOwnProperty(name)) {
        throw new TypeError(`Cannot define a method called ${name}`);
      }
      this[name] = this._callFunctionWithArgs.bind(this, name);
    });
  }

  _callFunctionWithArgs(method, ...args) {
    if (this._ending) {
      throw new Error('Farm is ended, no more calls can be done to it');
    }
    return this._farm.doWork(method, ...args);
  }

  async start() {
    await this._workerPool.start();
  }

  async end() {
    if (this._ending) {
      throw new Error('Farm is ended, no more calls can be done to it');
    }
    this._ending = true;
    return this._workerPool.end();
  }
  
  getStderr() {
    return this._workerPool.getStderr();
  }

  getStdout() {
    return this._workerPool.getStdout();
  }

  _getExposedMethods(workerPath, options) {
    let exposedMethods = options.exposedMethods;
    if (!exposedMethods) {
      const module = require(workerPath);
      exposedMethods = Object.keys(module).filter(name => typeof module[name] === 'function');
      if (typeof module === 'function') {
        exposedMethods = [...exposedMethods, 'default'];
      }
    }
    return exposedMethods;
  }

  _getNumberOfCpus() {
    return typeof os.availableParallelism === 'function'
      ? os.availableParallelism()
      : os.cpus().length;
  }
};
