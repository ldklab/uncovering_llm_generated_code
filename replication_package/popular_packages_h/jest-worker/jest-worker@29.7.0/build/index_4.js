'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
Object.defineProperty(exports, 'FifoQueue', {
  enumerable: true,
  get: function () {
    return _FifoQueue.default;
  }
});
Object.defineProperty(exports, 'PriorityQueue', {
  enumerable: true,
  get: function () {
    return _PriorityQueue.default;
  }
});
exports.Worker = void 0;
Object.defineProperty(exports, 'messageParent', {
  enumerable: true,
  get: function () {
    return _messageParent.default;
  }
});

const os = require('os');
const path = require('path');
const url = require('url');

var _Farm = _interopRequireDefault(require('./Farm'));
var _WorkerPool = _interopRequireDefault(require('./WorkerPool'));
var _PriorityQueue = _interopRequireDefault(require('./PriorityQueue'));
var _FifoQueue = _interopRequireDefault(require('./FifoQueue'));
var _messageParent = _interopRequireDefault(require('./workers/messageParent'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function getExposedMethods(workerPath, options) {
  let exposedMethods = options.exposedMethods;

  if (!exposedMethods) {
    const module = require(workerPath);
    exposedMethods = Object.keys(module).filter(
      name => typeof module[name] === 'function'
    );
    if (typeof module === 'function') {
      exposedMethods = [...exposedMethods, 'default'];
    }
  }
  return exposedMethods;
}

function getNumberOfCpus() {
  return typeof os.availableParallelism === 'function'
    ? os.availableParallelism()
    : os.cpus().length;
}

class Worker {
  _ending;
  _farm;
  _options;
  _workerPool;

  constructor(workerPath, options) {
    this._options = { ...options };
    this._ending = false;

    if (typeof workerPath !== 'string') {
      workerPath = workerPath.href;
    }
    if (workerPath.startsWith('file:')) {
      workerPath = url.fileURLToPath(workerPath);
    } else if (!path.isAbsolute(workerPath)) {
      throw new Error(`'workerPath' must be absolute, got '${workerPath}'`);
    }

    const workerPoolOptions = {
      enableWorkerThreads: this._options.enableWorkerThreads ?? false,
      forkOptions: this._options.forkOptions ?? {},
      idleMemoryLimit: this._options.idleMemoryLimit,
      maxRetries: this._options.maxRetries ?? 3,
      numWorkers: this._options.numWorkers ?? Math.max(getNumberOfCpus() - 1, 1),
      resourceLimits: this._options.resourceLimits ?? {},
      setupArgs: this._options.setupArgs ?? []
    };

    if (this._options.WorkerPool) {
      this._workerPool = new this._options.WorkerPool(workerPath, workerPoolOptions);
    } else {
      this._workerPool = new _WorkerPool.default(workerPath, workerPoolOptions);
    }

    this._farm = new _Farm.default(
      workerPoolOptions.numWorkers,
      this._workerPool.send.bind(this._workerPool),
      {
        computeWorkerKey: this._options.computeWorkerKey,
        taskQueue: this._options.taskQueue,
        workerSchedulingPolicy: this._options.workerSchedulingPolicy
      }
    );
    this._bindExposedWorkerMethods(workerPath, this._options);
  }

  _bindExposedWorkerMethods(workerPath, options) {
    getExposedMethods(workerPath, options).forEach(name => {
      if (name.startsWith('_')) {
        return;
      }

      if (this.constructor.prototype.hasOwnProperty(name)) {
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

  getStderr() {
    return this._workerPool.getStderr();
  }

  getStdout() {
    return this._workerPool.getStdout();
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
}

exports.Worker = Worker;
