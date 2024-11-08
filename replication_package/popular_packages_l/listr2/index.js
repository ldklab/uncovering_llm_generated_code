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

class Listr2 extends EventEmitter {
  constructor(tasks = [], options = { concurrent: false }) {
    super();
    this.tasks = tasks.map(t => new Task(t.title, t.task));
    this.options = options;
  }

  async run(context = {}) {
    const executions = this.tasks.map(task => this.executeTask(task, context));
    if (this.options.concurrent) {
      await Promise.all(executions);
    } else {
      for (let exec of executions) {
        await exec();
      }
    }
  }

  executeTask(task, context) {
    return async () => {
      this.emit('stateChange', task);
      try {
        await task.run(context);
        this.emit('stateChange', task);
      } catch (error) {
        this.emit('stateChange', task);
        throw error;
      }
    };
  }
}

// Example usage
const tasks = [
  { title: 'Task 1', task: async (ctx) => { /* perform task 1 */ } },
  { title: 'Task 2', task: async (ctx) => { /* perform task 2 */ } }
];

const list = new Listr2(tasks, { concurrent: false });

list.on('stateChange', (task) => {
  console.log(`${task.title} is ${task.state}`);
});

list.run().catch(error => console.error(error));

module.exports = Listr2;
