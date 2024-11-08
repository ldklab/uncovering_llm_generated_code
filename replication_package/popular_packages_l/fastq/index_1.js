'use strict';

class FastQueue {
  constructor(context, workerFunction, concurrencyLimit, promisesEnabled = false) {
    this.context = context;
    this.workerFunction = workerFunction;
    this.concurrencyLimit = concurrencyLimit;
    this.taskQueue = [];
    this.activeWorkers = 0;
    this.isPaused = false;
    this.onDrain = () => {};
    this.onEmpty = () => {};
    this.onSaturated = () => {};
    this.errorHandler = null;
    this.promisesEnabled = promisesEnabled;
  }

  addTask(task, callback) {
    return new Promise((resolve, reject) => {
      const taskCallback = (error, result) => {
        if (this.errorHandler) this.errorHandler(error, task);
        if (callback) return callback(error, result);
        if (error) return reject(error);
        resolve(result);
      };

      this.taskQueue.push({ task, taskCallback });
      process.nextTick(() => this._processQueue());
    });
  }

  addTaskToFront(task, callback) {
    return new Promise((resolve, reject) => {
      const taskCallback = (error, result) => {
        if (this.errorHandler) this.errorHandler(error, task);
        if (callback) return callback(error, result);
        if (error) return reject(error);
        resolve(result);
      };

      this.taskQueue.unshift({ task, taskCallback });
      process.nextTick(() => this._processQueue());
    });
  }

  pauseQueue() {
    this.isPaused = true;
  }

  resumeQueue() {
    this.isPaused = false;
    this._processQueue();
  }

  isIdle() {
    return this.activeWorkers === 0 && this.taskQueue.length === 0;
  }

  queueLength() {
    return this.taskQueue.length;
  }

  getCurrentQueue() {
    return this.taskQueue.slice();
  }

  terminateQueue() {
    this.taskQueue.length = 0;
    this.onDrain = () => {};
  }

  terminateQueueAndDrain() {
    this.terminateQueue();
    this.onDrain();
  }

  setErrorHandler(handler) {
    this.errorHandler = handler;
  }

  _processQueue() {
    if (this.isPaused || this.activeWorkers >= this.concurrencyLimit) return;
    const taskData = this.taskQueue.shift();
    if (!taskData) return;
    if (this.taskQueue.length === 0) this.onEmpty();

    this.activeWorkers += 1;
    if (this.activeWorkers === this.concurrencyLimit) this.onSaturated();

    const { task, taskCallback } = taskData;
    const workerFn = this.workerFunction.bind(this.context);

    if (this.promisesEnabled) {
      workerFn(task)
        .then(result => {
          taskCallback(null, result);
          this._taskComplete();
        })
        .catch(error => {
          taskCallback(error);
          this._taskComplete();
        });
    } else {
      workerFn(task, (error, result) => {
        taskCallback(error, result);
        this._taskComplete();
      });
    }
  }

  _taskComplete() {
    this.activeWorkers -= 1;
    if (this.isIdle()) this.onDrain();
    this._processQueue();
  }
}

function createFastQueue(context, workerFunction, concurrencyLimit) {
  return new FastQueue(context, workerFunction, concurrencyLimit, false);
}

createFastQueue.promise = function(context, workerFunction, concurrencyLimit) {
  return new FastQueue(context, workerFunction, concurrencyLimit, true);
};

module.exports = createFastQueue;
