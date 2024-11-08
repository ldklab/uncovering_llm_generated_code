// parent.js
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const os = require('os');
const path = require('path');

class TaskWorkerManager {
  constructor(workerScript, options = {}) {
    this.workerScript = workerScript;
    this.options = options;
    this.methodNames = options.exposedMethods || this.detectExposedMethods();
    this.workers = [];
    this.createWorkers();
  }

  createWorkers() {
    const workerCount = this.options.numWorkers || os.cpus().length - 1;
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(new Worker(this.workerScript, { workerData: { options: this.options } }));
    }
  }

  detectExposedMethods() {
    const workerModule = require(this.workerScript);
    return Object.keys(workerModule).filter((key) => typeof workerModule[key] === 'function');
  }

  executeMethod(methodName, ...args) {
    return new Promise((resolve, reject) => {
      const worker = this.selectWorker(methodName, args);
      worker.once('message', resolve);
      worker.once('error', reject);
      worker.postMessage({ methodName, args });
    });
  }

  selectWorker(methodName, args) {
    if (this.options.computeKey) {
      const key = this.options.computeKey(methodName, ...args);
      const index = key ? (key.hashCode() % this.workers.length) : Math.floor(Math.random() * this.workers.length);
      return this.workers[index];
    }
    return this.workers[Math.floor(Math.random() * this.workers.length)];
  }

  terminateAllWorkers() {
    return Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = ((hash << 5) - hash) + this.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

async function main() {
  const workerScriptPath = path.resolve(__dirname, 'worker.js');
  const taskManager = new TaskWorkerManager(workerScriptPath, {
    exposedMethods: ['foo', 'bar'],
    computeKey: (method, name) => name
  });

  console.log(await taskManager.executeMethod('foo', 'Alice'));
  console.log(await taskManager.executeMethod('bar', 'Bob'));

  await taskManager.terminateAllWorkers();
}

if (isMainThread) {
  main();
}

// worker.js
if (!isMainThread) {
  parentPort.on('message', async ({ methodName, args }) => {
    try {
      const result = availableMethods[methodName](...args);
      parentPort.postMessage(result instanceof Promise ? await result : result);
    } catch (err) {
      parentPort.postMessage({ error: err.message });
    }
  });

  const availableMethods = {
    foo: (name) => `Hello from foo: ${name}`,
    bar: (name) => `Hello from bar: ${name}`
  };
}
