const EventEmitter = require('events');

class Task {
  constructor(title, task) {
    this.title = title;
    this.task = task;
    this.state = 'pending';
  }

  async run(ctx) {
    this.state = 'running';
    try {
      await this.task(ctx);
      this.state = 'completed';
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }
}

class TaskManager extends EventEmitter {
  constructor(tasks = [], options = { concurrent: false }) {
    super();
    this.tasks = tasks.map(({ title, task }) => new Task(title, task));
    this.options = options;
  }

  async run(context = {}) {
    const runTasks = this.tasks.map(task => this.createTaskExecutor(task, context));
    return this.options.concurrent ? Promise.all(runTasks.map(fn => fn())) : this.executeSequentially(runTasks);
  }

  async executeSequentially(executors) {
    for (const exec of executors) {
      await exec();
    }
  }

  createTaskExecutor(task, context) {
    return async () => {
      this.emit('stateChange', task);
      try {
        await task.run(context);
      } finally {
        this.emit('stateChange', task);
      }
    };
  }
}

// Example usage
const tasks = [
  { title: 'Task 1', task: async (ctx) => { /* perform task 1 */ } },
  { title: 'Task 2', task: async (ctx) => { /* perform task 2 */ } }
];

const taskManager = new TaskManager(tasks, { concurrent: false });

taskManager.on('stateChange', (task) => {
  console.log(`${task.title} is ${task.state}`);
});

taskManager.run().catch(console.error);

module.exports = TaskManager;
