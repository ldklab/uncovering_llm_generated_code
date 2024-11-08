/*
 * Jake JavaScript build tool
 * Licensed under the Apache License, Version 2.0 (the "License");
 * 
*/

const { EventEmitter } = require('events');
const fs = require('fs');
const chalk = require('chalk');

const {
  Task,
  FileTask,
  DirectoryTask,
  Rule,
  Namespace,
  RootNamespace
} = require('./task');

const {
  logger,
  exec,
  file: fileUtils
} = require('./utils');

const api = require('./api');
const { Program } = require('./program');
const loader = require('./loader')();
const { FileList } = require('filelist');
const {
  PackageTask,
  PublishTask,
  TestTask
} = require('./task');

if (!global.jake) {
  const pkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf-8'));

  global.jake = Object.assign(new EventEmitter(), new function Jake() {
    this._invocationChain = [];
    this._taskTimeout = 30000;

    this.version = pkg.version;
    this.errorCode = null;
    this.loader = loader;
    this.rootNamespace = new RootNamespace();
    this.defaultNamespace = this.rootNamespace;
    this.currentNamespace = this.defaultNamespace;
    this.currentTaskDescription = null;
    this.program = new Program();
    this.FileList = FileList;
    this.PackageTask = PackageTask;
    this.PublishTask = PublishTask;
    this.TestTask = TestTask;
    this.Task = Task;
    this.FileTask = FileTask;
    this.DirectoryTask = DirectoryTask;
    this.Namespace = Namespace;
    this.Rule = Rule;
    
    Object.assign(this, api, fileUtils);
    Object.assign(global, api);
    
    this.parseAllTasks = function() {
      const _parseNs = (ns) => {
        for (let taskName in ns.tasks) {
          jake.Task[ns.tasks[taskName].fullName] = ns.tasks[taskName];
        }
        for (let nsName in ns.childNamespaces) {
          _parseNs(ns.childNamespaces[nsName]);
        }
      };
      _parseNs(this.defaultNamespace);
    };

    this.showAllTaskDescriptions = function(f) {
      const filter = typeof f === 'string' ? f : null;
      const tasksToShow = Object.values(jake.Task).filter(task =>
        task.description && (!filter || task.fullName.includes(filter))
      );

      const maxTaskNameLength = Math.max(...tasksToShow.map(task =>
        task.fullName.length + task.params.length
      ));

      tasksToShow.forEach(task => {
        const name = chalk.green(task.fullName);
        const descr = chalk.gray(`# ${task.description}`);
        const taskParams = task.params ? `[${task.params}]` : '';
        const padding = ' '.repeat(maxTaskNameLength - task.fullName.length - taskParams.length + 4);
        console.log(`jake ${name}${taskParams}${padding}${descr}`);
      });
    };

    this.createTask = function(type, ...args) {
      let [name, prereqs, optsAction1, optsAction2] = args;
      let task = this.currentNamespace.resolveTask(name);
      const options = optsAction1 && typeof optsAction1 === 'object' ? optsAction1 : (optsAction2 && typeof optsAction2 === 'object' ? optsAction2 : {});
      const action = typeof optsAction1 === 'function' ? optsAction1 : (typeof optsAction2 === 'function' ? optsAction2 : undefined);

      if (task && !action) {
        task.prereqs.push(...prereqs);
        return task;
      }

      if (type === 'directory') {
        task = new DirectoryTask(name, prereqs, () => jake.mkdirP(name), options);
      } else if (type === 'file') {
        task = new FileTask(name, prereqs, action, options);
      } else {
        task = new Task(name, prereqs, action, options);
      }

      this.currentNamespace.addTask(task);
      task.description = this.currentTaskDescription;
      this.currentTaskDescription = null;
      this.parseAllTasks();

      return task;
    };

    this.attemptRule = function(name, ns, level = 0) {
      if (level > 16) return null;
      const prereqRule = ns.matchRule(name);
      return prereqRule ? prereqRule.createTask(name, level) : null;
    };

    this.createPlaceholderFileTask = function(name, namespace) {
      const [filePath] = name.split(':').slice(-1);
      let task = namespace.resolveTask(name);

      if (!task && fs.existsSync(filePath)) {
        task = new jake.FileTask(filePath);
        task.dummy = true;
        const ns = namespace.resolveNamespace(name.split(':').slice(0, -1).join(':')) || namespace;
        ns.addTask(task);
        jake.Task[`${ns.path}:${filePath}`] = task;
      }
      return task || null;
    };

    this.run = function(...args) {
      this.program.parseArgs(args);
      this.program.init();

      const preempt = this.program.firstPreemptiveOption();
      if (preempt) return preempt();

      const opts = this.program.opts;
      if (opts.autocomplete && opts.jakefile === true) {
        return process.stdout.write('no-complete');
      }

      const jakefileLoaded = loader.loadFile(opts.jakefile);
      const jakelibdirLoaded = loader.loadDirectory(opts.jakelibdir);

      if (!jakefileLoaded && !jakelibdirLoaded && !opts.autocomplete) {
        throw new Error('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
      }

      this.program.run();
    };
  }());
}

module.exports = global.jake;
