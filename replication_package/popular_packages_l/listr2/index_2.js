const EventEmitter = require('events');

class Task {
  constructor(title, taskFn) {
    this.title = title;
    this.taskFn = taskFn;
    this.state = 'pending';
  }

  async execute(ctx) {
    this.state = 'running';
    try {
      await this.taskFn(ctx);
      this.state = 'completed';
    } catch (err) {
      this.state = 'failed';
      throw err;
    }
  }
}

class TaskRunner extends EventEmitter {
  constructor(tasks = [], options = { concurrent: false }) {
    super();
    this.tasks = tasks.map(({ title, task }) => new Task(title, task));
    this.concurrent = options.concurrent;
  }

  async runTasks(ctx = {}) {
    const taskExecutions = this.tasks.map(task => this.createTaskExecutor(task, ctx));
    if (this.concurrent) {
      await Promise.all(taskExecutions);
    } else {
      for (const exec of taskExecutions) {
        await exec();
      }
    }
  }

  createTaskExecutor(task, ctx) {
    return async () => {
      this.emit('taskStateChanged', task);
      try {
        await task.execute(ctx);
        this.emit('taskStateChanged', task);
      } catch (err) {
        this.emit('taskStateChanged', task);
        throw err;
      }
    };
  }
}

// Example usage
const sampleTasks = [
  { title: 'Task 1', task: async (ctx) => { /* perform task 1 */ } },
  { title: 'Task 2', task: async (ctx) => { /* perform task 2 */ } }
];

const taskManager = new TaskRunner(sampleTasks, { concurrent: false });

taskManager.on('taskStateChanged', task => {
  console.log(`${task.title} is ${task.state}`);
});

taskManager.runTasks().catch(err => console.error(err));

module.exports = TaskRunner;
