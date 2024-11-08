// parent.js
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const path = require('path');
const os = require('os');

class JestWorker {
  constructor(workerPath, options = {}) {
    this.workerPath = workerPath;
    this.options = options;
    this.workers = [];
    this.methodNames = options.exposedMethods || this.inferExposedMethods();
    this.numWorkers = options.numWorkers || os.cpus().length - 1;
    this.initializeWorkers();
  }

  initializeWorkers() {
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = new Worker(this.workerPath, { workerData: { options: this.options } });
      this.workers.push(worker);
    }
  }

  inferExposedMethods() {
    const workerModule = require(this.workerPath);
    return Object.keys(workerModule).filter(
      name => typeof workerModule[name] === 'function'
    );
  }

  exec(method, ...args) {
    return new Promise((resolve, reject) => {
      const worker = this.selectWorker(method, args);
      worker.once('message', resolve);
      worker.once('error', reject);
      worker.postMessage({ method, args });
    });
  }

  selectWorker(method, args) {
    if (this.options.computeWorkerKey) {
      const key = this.options.computeWorkerKey(method, ...args);
      const workerIndex = key ? (this.stringHash(key) % this.workers.length) : Math.floor(Math.random() * this.workers.length);
      return this.workers[workerIndex];
    }
    return this.workers[Math.floor(Math.random() * this.workers.length)];
  }

  stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }

  end() {
    return Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

async function main() {
  const workerPath = path.resolve(__dirname, 'worker.js');
  const myWorker = new JestWorker(workerPath, {
    exposedMethods: ['foo', 'bar'],
    computeWorkerKey: (method, filename) => filename
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
