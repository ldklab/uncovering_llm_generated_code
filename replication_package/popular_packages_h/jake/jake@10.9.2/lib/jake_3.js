/**
 * Jake JavaScript build tool
 * Main module initialization and task management
 */

if (!global.jake) {

  const { EventEmitter } = require('events');
  global.jake = new EventEmitter();

  const fs = require('fs');
  const chalk = require('chalk');
  const { Task, FileTask, DirectoryTask } = require('./task');
  const { Rule } = require('./rule');
  const { Namespace, RootNamespace } = require('./namespace');
  const api = require('./api');
  const utils = require('./utils');
  const { Program } = require('./program');
  const loader = require('./loader')();
  const pkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf8'));

  const MAX_RULE_RECURSION_LEVEL = 16;

  Object.assign(global, api);
  Object.assign(jake, utils.file, {
    logger: utils.logger,
    exec: utils.exec,
    ...api
  });

  Object.assign(jake, new (class {
    constructor() {
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
      this.FileList = require('filelist').FileList;
      this.PackageTask = require('./package_task').PackageTask;
      this.PublishTask = require('./publish_task').PublishTask;
      this.TestTask = require('./test_task').TestTask;
      this.Task = Task;
      this.FileTask = FileTask;
      this.DirectoryTask = DirectoryTask;
      this.Namespace = Namespace;
      this.Rule = Rule;
    }

    parseAllTasks() {
      const _parseNs = (ns) => {
        for (const q in ns.tasks) {
          jake.Task[ns.tasks[q].fullName] = ns.tasks[q];
        }
        for (const p in ns.childNamespaces) {
          _parseNs(ns.childNamespaces[p]);
        }
      };
      _parseNs(jake.defaultNamespace);
    }

    showAllTaskDescriptions(filter = null) {
      let maxTaskNameLength = 0;
      const taskDescriptions = [];

      for (const p in jake.Task) {
        if (filter && !p.includes(filter)) continue;
        const task = jake.Task[p];
        const taskParams = task.params.length ? `[${task.params}]` : "";
        const fullTaskName = p + taskParams;

        if (task.description) {
          maxTaskNameLength = Math.max(maxTaskNameLength, fullTaskName.length);
          taskDescriptions.push({ name: chalk.green(fullTaskName), description: chalk.gray(`# ${task.description}`) });
        }
      }

      for (const { name, description } of taskDescriptions) {
        const padding = ' '.repeat(maxTaskNameLength + 4 - name.length);
        console.log(`jake ${name}${padding}${description}`);
      }
    }

    createTask(type, ...args) {
      let name, action, opts = {}, prereqs = [];
      if (typeof args[0] === 'string') {
        name = args.shift();
        if (Array.isArray(args[0])) prereqs = args.shift();
      } else {
        const obj = args.shift();
        for (const p in obj) {
          prereqs = prereqs.concat(obj[p]);
          name = p;
        }
      }

      args.forEach(arg => typeof arg === 'function' ? action = arg : opts = { ...opts, ...arg });

      let task = jake.currentNamespace.resolveTask(name);
      if (task && !action) {
        task.prereqs.push(...prereqs);
        return task;
      }

      action ??= type === 'directory' ? () => jake.mkdirP(name) : undefined;
      switch (type) {
        case 'directory': task = new DirectoryTask(name, prereqs, action, opts); break;
        case 'file': task = new FileTask(name, prereqs, action, opts); break;
        default: task = new Task(name, prereqs, action, opts);
      }

      jake.currentNamespace.addTask(task);

      if (jake.currentTaskDescription) {
        task.description = jake.currentTaskDescription;
        jake.currentTaskDescription = null;
      }

      jake.parseAllTasks();
      return task;
    }

    attemptRule(name, ns, level) {
      if (level > MAX_RULE_RECURSION_LEVEL) return null;
      const prereqRule = ns.matchRule(name);
      return prereqRule ? prereqRule.createTask(name, level) : null;
    }

    createPlaceholderFileTask(name, namespace) {
      const [filePath] = name.split(':').slice(-1);
      let task = namespace.resolveTask(name);

      if (!task && fs.existsSync(filePath)) {
        task = new jake.FileTask(filePath, [], () => {});
        task.dummy = true;
        const ns = namespace.resolveNamespace(name.split(':').slice(0, -1).join(':')) || namespace;
        ns?.addTask(task);
        jake.Task[`${ns.path}:${filePath}`] = task;
      }
      return task;
    }

    run(...args) {
      const { opts, firstPreemptiveOption } = this.program;

      this.program.parseArgs(args);
      this.program.init();

      const preempt = firstPreemptiveOption();
      if (preempt) {
        preempt();
      } else {
        const jakefileLoaded = this.loader.loadFile(opts.jakefile);
        const jakelibdirLoaded = this.loader.loadDirectory(opts.jakelibdir);

        if (!jakefileLoaded && !jakelibdirLoaded && !opts.autocomplete) {
          fail('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
        }

        this.program.run();
      }
    }
  })());
}

module.exports = jake;
