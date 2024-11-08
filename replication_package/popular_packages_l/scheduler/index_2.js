class Scheduler {
  constructor() {
    this.taskQueue = [];
    this.requestIdleCallbackId = null;
  }

  addTask(callback) {
    this.taskQueue.push(callback);
    this.scheduleNextTask();
  }

  scheduleNextTask() {
    if (this.taskQueue.length > 0 && !this.requestIdleCallbackId) {
      this.requestIdleCallbackId = requestIdleCallback(deadline => this.runTasks(deadline));
    }
  }

  runTasks(deadline) {
    while (this.taskQueue.length > 0 && deadline.timeRemaining() > 0) {
      const task = this.taskQueue.shift();
      task();
    }

    this.requestIdleCallbackId = null;

    if (this.taskQueue.length > 0) this.scheduleNextTask();
  }
}

// Example usage:
const scheduler = new Scheduler();

scheduler.addTask(() => console.log('Task 1'));
scheduler.addTask(() => console.log('Task 2'));
scheduler.addTask(() => console.log('Task 3'));

function requestIdleCallback(callback) {
  // Fallback for Node.js: simulate the browser's requestIdleCallback function
  return setTimeout(() => {
    callback({
      timeRemaining() {
        return Number.MAX_VALUE; // Simulate a large idle time
      }
    });
  }, 0);
}

global.requestIdleCallback = requestIdleCallback; // Mocking browser environment
