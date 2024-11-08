"use strict";

const { EventEmitter } = require('events');
const colorette = require('colorette');
const util = require('util');
const os = require('os');
const stream = require('stream');
const { StringDecoder } = require('string_decoder');
const { randomUUID } = require('crypto');
const rfdc = require('rfdc');

// Utility Functions
const isObservable = obj => !!obj && typeof obj.subscribe === 'function';
const isReadable = obj => !!obj && typeof obj.read === 'function' && obj.readable;
const cleanseAnsi = chunk => String(chunk).replace(/(?:\u001b|\u009b)[[\\]?[;0-9]*[a-zA-Z]/g, "").trim();
const indent = (string, count) => string.replace(/^(?!\s*$)/gm, " ".repeat(count));

const cloneObject = obj => {
  const clone = rfdc({ circles: true });
  return clone(obj);
};

const delay = time => new Promise(resolve => setTimeout(resolve, time));

const splat = (message, ...splatArgs) => util.format(String(message), ...splatArgs);

const isUnicodeSupported = () => !!process.env.LISTR_FORCE_UNICODE || process.platform !== 'win32' || !!process.env.CI || !!process.env.WT_SESSION || process.env.TERM_PROGRAM === 'vscode' || process.env.TERM === 'xterm-256color' || process.env.TERM === 'alacritty';

function createWritable(cb) {
  const writable = new stream.Writable();
  writable.write = (chunk) => {
    cb(chunk.toString());
    return true;
  };
  return writable;
}

const Colors = colorette.createColors();

// Task Definitions
class Task {
  constructor(listr, task, options) {
    this.listr = listr;
    this.task = task;
    this.options = options;
    this.id = randomUUID();
    this.state = 'WAITING';
    this.title = task.title;
    this.initialTitle = this.title;
    this.taskFn = task.task;
    this.listr.events.on('UPDATE_RENDER', this.renderUpdate.bind(this));
  }

  async run(ctx) {
    this.state = 'STARTED';
    this.emit('stateChange', this.state);
    try {
      const result = this.taskFn(ctx);
      if (result instanceof Promise) {
        await result;
      }
      this.state = 'COMPLETED';
    } catch (error) {
      this.state = 'FAILED';
    } finally {
      this.emit('stateChange', this.state);
    }
  }

  renderUpdate() {
    if (this.state === 'STARTED') {
      console.log(`${Colors.yellow('[STARTED]')} ${this.title}`);
    } else if (this.state === 'COMPLETED') {
      console.log(`${Colors.green('[COMPLETED]')} ${this.title}`);
    } else if (this.state === 'FAILED') {
      console.error(`${Colors.red('[FAILED]')} ${this.title}`);
    }
  }
}

// Listr Overview
class Listr {
  constructor(tasks, options = {}) {
    this.tasks = (Array.isArray(tasks) ? tasks : [tasks]).map(t => new Task(this, t, options));
    this.options = options;
    this.events = new EventEmitter();
  }

  async run(ctx) {
    await Promise.all(this.tasks.map(task => task.run(ctx)));
  }
}

// Initialize Example Tasks
const tasks = [
  {
    title: 'Task 1',
    task: async (ctx) => {
      await delay(1000);
    }
  },
  {
    title: 'Task 2',
    task: async (ctx) => {
      await delay(500);
    }
  }
];

// Execute List of Tasks
(async () => {
  const myTasks = new Listr(tasks);
  await myTasks.run();
})();
