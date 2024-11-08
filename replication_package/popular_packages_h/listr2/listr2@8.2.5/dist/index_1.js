"use strict";
// Utility functions for modules
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { cloneDeep } = require('lodash');
const util = require('util');
const colorette = require('colorette');

// Define ANSI codes
const ANSI_ESC = "\x1B[";
const ANSI_CODES = {
  HIDE_CURSOR: `${ANSI_ESC}?25l`,
  SHOW_CURSOR: `${ANSI_ESC}?25h`
};

// Task Management and Rendering
class TaskManager {
  constructor() {
    this.tasks = [];
    this.events = new EventEmitter();
  }

  addTask(task) {
    const newTask = new Task(task, this);
    this.tasks.push(newTask);
    return newTask;
  }
}

class Task {
  constructor(task, manager) {
    this.title = task.title;
    this.exec = task.exec;
    this.state = 'pending';
    this.manager = manager;
  }

  async run(ctx) {
    this.state = 'running';
    this.manager.events.emit('update', this.title, 'running');
    try {
      await this.exec(ctx);
      this.state = 'completed';
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
    this.manager.events.emit('update', this.title, this.state);
  }
}

// Renderer
class Renderer {
  constructor(tasks, options) {
    this.tasks = tasks;
    this.options = options;
  }

  render() {
    this.tasks.forEach(task => {
      console.log(Renderer.style(task.state), task.title);
    });
  }

  static style(state) {
    switch (state) {
      case 'running':
        return colorette.cyan('Running');
      case 'completed':
        return colorette.green('Completed');
      case 'failed':
        return colorette.red('Failed');
      default:
        return colorette.yellow('Pending');
    }
  }
}

// Helper Functions
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Example Usage
(async () => {
  const manager = new TaskManager();
  manager.addTask({
    title: 'Task 1',
    exec: async (ctx) => {
      await delay(1000);
      console.log('Task 1 completed');
    }
  });

  const renderer = new Renderer(manager.tasks);

  manager.events.on('update', (title, state) => {
    renderer.render();
  });

  for (const task of manager.tasks) {
    try {
      await task.run({});
    } catch (error) {
      console.error(`Error in ${task.title}:`, error.message);
    }
  }

  console.log('All tasks finished');
})();
