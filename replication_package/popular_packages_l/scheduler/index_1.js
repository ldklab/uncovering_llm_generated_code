class Scheduler {
  constructor() {
    this.taskQueue = [];
    this.requestIdleCallbackId = null;
  }

  // Add a new task to the queue and schedule its execution
  addTask(callback) {
    this.taskQueue.push(callback);
    this.scheduleNextTask();
  }

  // Schedule the execution of the next task if not already scheduled
  scheduleNextTask() {
    if (this.taskQueue.length > 0 && !this.requestIdleCallbackId) {
      this.requestIdleCallbackId = requestIdleCallback(deadline => this.runTasks(deadline));
    }
  }

  // Run tasks from the task queue as long as there is time remaining
  runTasks(deadline) {
    while (this.taskQueue.length > 0 && deadline.timeRemaining() > 0) {
      const task = this.taskQueue.shift();
      task();
    }

    // Reset the requestIdleCallback ID
    this.requestIdleCallbackId = null;

    // Reschedule if there are still tasks left
    if (this.taskQueue.length > 0) {
      this.scheduleNextTask();
    }
  }
}

// Usage example:
const scheduler = new Scheduler();

scheduler.addTask(() => console.log('Task 1'));
scheduler.addTask(() => console.log('Task 2'));
scheduler.addTask(() => console.log('Task 3'));

// Function to simulate `requestIdleCallback` in Node.js environment 
function requestIdleCallback(callback) {
  // Use `setTimeout` to simulate the behavior of `requestIdleCallback`
  return setTimeout(() => {
    callback({
      // Simulate an environment where a lot of time is available to execute tasks
      timeRemaining() {
        return Number.MAX_VALUE; // Provide a large available time
      }
    });
  }, 0);
}

// Simulate a global requestIdleCallback for the Node.js environment
global.requestIdleCallback = requestIdleCallback;
