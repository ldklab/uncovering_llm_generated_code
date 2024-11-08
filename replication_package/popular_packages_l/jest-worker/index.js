// parent.js
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const path = require('path');

class JestWorker {
  constructor(workerPath, options = {}) {
    this.workerPath = workerPath;
    this.workers = [];
    this.options = options;
    this.methodNames = options.exposedMethods || this.getExposedMethods();
    this.numWorkers = options.numWorkers || require('os').cpus().length - 1;
    this.setupWorkers();
  }

  // Initializes workers
  setupWorkers() {
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = new Worker(this.workerPath, { workerData: { options: this.options } });
      this.workers.push(worker);
    }
  }

  // Obtain method names by reflection if not provided
  getExposedMethods() {
    const workerModule = require(this.workerPath);
    return Object.keys(workerModule).filter(name => typeof workerModule[name] === 'function');
  }

  // Executes a method on a worker
  exec(method, ...args) {
    return new Promise((resolve, reject) => {
      const worker = this.chooseWorker(method, args);
      worker.once('message', resolve);
      worker.once('error', reject);
      worker.postMessage({ method, args });
    });
  }

  // Choose a worker based on round-robin or bound keys
  chooseWorker(method, args) {
    if (this.options.computeWorkerKey) {
      const key = this.options.computeWorkerKey(method, ...args);
      // Use a simple hash to index worker by key
      const workerIndex = key ? (key.hashCode() % this.workers.length) : Math.floor(Math.random() * this.workers.length);
      return this.workers[workerIndex];
    }
    return this.workers[Math.floor(Math.random() * this.workers.length)];
  }

  // Terminates all workers
  end() {
    return Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

// Extending String prototype to create a simple hash function
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Example in parent.js using JestWorker
async function main() {
  const workerPath = path.resolve(__dirname, 'worker.js');
  
  const myWorker = new JestWorker(workerPath, {
    exposedMethods: ['foo', 'bar'],
    computeWorkerKey: (method, filename) => filename // Example of a key function
  });

  console.log(await myWorker.exec('foo', 'Alice'));
  console.log(await myWorker.exec('bar', 'Bob'));

  await myWorker.end();
}

if (isMainThread) {
  main();
}

// worker.js
if (!isMainThread) {
  parentPort.on('message', async (task) => {
    const { method, args } = task;
    try {
      const result = workerMethods[method](...args);
      const output = (result instanceof Promise) ? await result : result;
      parentPort.postMessage(output);
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });

  const workerMethods = {
    foo: (param) => `Hello from foo: ${param}`,
    bar: (param) => `Hello from bar: ${param}`
  };
}
