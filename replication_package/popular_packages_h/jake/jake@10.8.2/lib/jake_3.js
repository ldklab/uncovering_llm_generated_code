/*
 * Jake JavaScript Build Tool
 * © 2112 Matthew Eernisse (mde@fleegix.org)
 * Licensed under the Apache License, Version 2.0
 */

if (!global.jake) {
  const { EventEmitter } = require('events');
  const fs = require('fs');
  const chalk = require('chalk');
  const taskNs = require('./task');
  const { Rule } = require('./rule');
  const { Namespace, RootNamespace } = require('./namespace');
  const api = require('./api');
  const utils = require('./utils');
  const { Program } = require('./program');
  const loader = require('./loader')();
  const pkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf8'));

  global.jake = new EventEmitter();
  const { Task, FileTask, DirectoryTask } = taskNs;
  const MAX_RULE_RECURSION_LEVEL = 16;

  Object.assign(global, api);
  Object.assign(jake, utils.logger, utils.exec, utils.file);
  Object.assign(jake, api);

  Object.assign(jake, {
    _invocationChain: [],
    _taskTimeout: 30000,
    version: pkg.version,
    errorCode: null,
    loader,
    rootNamespace: new RootNamespace(),
    defaultNamespace: new RootNamespace(),
    currentNamespace: new RootNamespace(),
    currentTaskDescription: null,
    program: new Program(),
    FileList: require('filelist').FileList,
    PackageTask: require('./package_task').PackageTask,
    PublishTask: require('./publish_task').PublishTask,
    TestTask: require('./test_task').TestTask,
    Task,
    FileTask,
    DirectoryTask,
    Namespace,
    Rule,

    parseAllTasks() {
      const _parseNs = (ns) => {
        for (const taskName in ns.tasks) {
          jake.Task[ns.tasks[taskName].fullName] = ns.tasks[taskName];
        }
        for (const subNs in ns.childNamespaces) {
          _parseNs(ns.childNamespaces[subNs]);
        }
      };
      _parseNs(jake.defaultNamespace);
    },

    showAllTaskDescriptions(filter) {
      let maxTaskNameLength = 0;
      for (const p in jake.Task) {
        if (jake.Task[p].description && (!filter || p.includes(filter))) {
          maxTaskNameLength = Math.max(maxTaskNameLength, p.length);
        }
      }
      for (const p in jake.Task) {
        if (!filter || p.includes(filter)) {
          const task = jake.Task[p];
          if (task.description) {
            const name = chalk.green(p);
            const descr = chalk.gray(`# ${task.description}`);
            const padding = ' '.repeat(maxTaskNameLength - p.length + 2);
            console.log(`jake ${name}${padding}${descr}`);
          }
        }
      }
    },

    createTask(type, ...args) {
      let name, prereqs = [], action, opts = {};
      if (typeof args[0] === 'string') {
        name = args.shift();
        if (Array.isArray(args[0])) prereqs = args.shift();
      } else {
        const obj = args.shift();
        name = Object.keys(obj)[0];
        prereqs = obj[name];
      }
      args.forEach(arg => {
        if (typeof arg === 'function') action = arg;
        else opts = { ...opts, ...arg };
      });

      let task = jake.currentNamespace.resolveTask(name);
      if (task && !action) {
        task.prereqs.push(...prereqs);
        return task;
      }

      if (!task) {
        switch (type) {
          case 'directory':
            action = () => jake.mkdirP(name);
            task = new DirectoryTask(name, prereqs, action, opts);
            break;
          case 'file':
            task = new FileTask(name, prereqs, action, opts);
            break;
          default:
            task = new Task(name, prereqs, action, opts);
        }

        jake.currentNamespace.addTask(task);
        if (jake.currentTaskDescription) {
          task.description = jake.currentTaskDescription;
          jake.currentTaskDescription = null;
        }
        jake.parseAllTasks();
      }
      return task;
    },

    attemptRule(name, ns, level) {
      if (level > MAX_RULE_RECURSION_LEVEL) return null;
      const prereqRule = ns.matchRule(name);
      return prereqRule ? prereqRule.createTask(name, level) : null;
    },

    createPlaceholderFileTask(name, namespace) {
      const [filePath] = name.split(':').slice(-1);
      let task = namespace.resolveTask(name);
      if (!task && fs.existsSync(filePath)) {
        task = new jake.FileTask(filePath);
        task.dummy = true;
        const ns = parsed.length ? namespace.resolveNamespace(parsed.join(':')) : namespace;
        ns.addTask(task);
        jake.Task[`${ns.path}:${filePath}`] = task;
      }
      return task;
    },

    run(...args) {
      const program = this.program;
      program.parseArgs(args);
      program.init();

      const preempt = program.firstPreemptiveOption();
      if (preempt) {
        preempt();
      } else {
        const opts = program.opts;
        if (opts.autocomplete && opts.jakefile === true) {
          process.stdout.write('no-complete');
          return;
        }
        const jakefileLoaded = loader.loadFile(opts.jakefile);
        const jakelibdirLoaded = loader.loadDirectory(opts.jakelibdir);
        if (!jakefileLoaded && !jakelibdirLoaded && !opts.autocomplete) {
          fail('No Jakefile found. Specify a valid a path with -f/--jakefile, or place one in the current directory.');
        }
        program.run();
      }
    }
  });
}

module.exports = jake;
