const { EventEmitter } = require('events');
const fs = require('fs');
const chalk = require('chalk');
const taskNs = require('./task');
const Rule = require('./rule').Rule;
const { Namespace, RootNamespace } = require('./namespace');
const api = require('./api');
const utils = require('./utils');
const { Program } = require('./program');
const loader = require('./loader')();
const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf-8'));

const {
  Task, FileTask, DirectoryTask
} = taskNs;
const MAX_RULE_RECURSION_LEVEL = 16;

if (!global.jake) {
  global.jake = new EventEmitter();

  Object.assign(global, api);
  jake.logger = utils.logger;
  jake.exec = utils.exec;
  Object.assign(jake, utils.file);

  Object.assign(jake, api);

  jake._invocationChain = [];
  jake._taskTimeout = 30000;
  jake.version = pkg.version;
  jake.errorCode = null;
  jake.loader = loader;
  jake.rootNamespace = new RootNamespace();
  jake.defaultNamespace = jake.rootNamespace;
  jake.currentNamespace = jake.defaultNamespace;
  jake.currentTaskDescription = null;
  jake.program = new Program();
  jake.FileList = require('filelist').FileList;
  jake.PackageTask = require('./package_task').PackageTask;
  jake.PublishTask = require('./publish_task').PublishTask;
  jake.TestTask = require('./test_task').TestTask;
  jake.Task = Task;
  jake.FileTask = FileTask;
  jake.DirectoryTask = DirectoryTask;
  jake.Namespace = Namespace;
  jake.Rule = Rule;

  jake.parseAllTasks = function () {
    const _parseNs = (ns) => {
      for (const q in ns.tasks) {
        jake.Task[ns.tasks[q].fullName] = ns.tasks[q];
      }
      for (const p in ns.childNamespaces) {
        _parseNs(ns.childNamespaces[p]);
      }
    };
    _parseNs(jake.defaultNamespace);
  };

  jake.showAllTaskDescriptions = function (f) {
    let maxTaskNameLength = 0;
    const filter = typeof f === 'string' ? f : null;

    for (const p in jake.Task) {
      const task = jake.Task[p];
      if (task.description && (!filter || p.includes(filter))) {
        maxTaskNameLength = Math.max(maxTaskNameLength, p.length);
      }
    }

    for (const p in jake.Task) {
      const task = jake.Task[p];
      if ((!filter || p.includes(filter)) && task.description) {
        const name = chalk.green(p);
        const descr = chalk.gray(`# ${task.description}`);
        const padding = ' '.repeat(maxTaskNameLength - p.length + 2);
        console.log(`jake ${name}${padding}${descr}`);
      }
    }
  };

  jake.createTask = function (...args) {
    let [type, ...rest] = args;
    let name, prereqs = [], action, opts = {};

    if (typeof rest[0] === 'string') {
      name = rest.shift();
      if (Array.isArray(rest[0])) prereqs = rest.shift();
    } else {
      const obj = rest.shift();
      for (const p in obj) {
        name = p;
        prereqs = obj[p];
      }
    }

    for (const arg of rest) {
      if (typeof arg === 'function') {
        action = arg;
      } else {
        opts = { ...arg };
      }
    }

    let task = jake.currentNamespace.resolveTask(name);
    if (task && !action) {
      task.prereqs = task.prereqs.concat(prereqs);
      return task;
    }

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
    return task;
  };

  jake.attemptRule = function (name, ns, level) {
    if (level > MAX_RULE_RECURSION_LEVEL) return null;
    return ns.matchRule(name)?.createTask(name, level) || null;
  };

  jake.createPlaceholderFileTask = function (name, namespace) {
    const filePath = name.split(':').pop();
    let task = namespace.resolveTask(name);

    if (!task && fs.existsSync(filePath)) {
      task = new jake.FileTask(filePath);
      task.dummy = true;
      const ns = name.includes(':') ? namespace.resolveNamespace(name.split(':').slice(0, -1).join(':')) : namespace;
      if (!ns) throw new Error('Invalid namespace, cannot add FileTask');
      ns.addTask(task);
      jake.Task[`${ns.path}:${filePath}`] = task;
    }

    return task || null;
  };

  jake.run = function (...args) {
    jake.program.parseArgs(args);
    jake.program.init();
    
    const preempt = jake.program.firstPreemptiveOption();
    if (preempt) {
      preempt();
    } else {
      const { jakefile, jakelibdir } = jake.program.opts;
      if (jake.program.opts.autocomplete && jakefile === true) {
        process.stdout.write('no-complete');
        return;
      }

      const jakefileLoaded = loader.loadFile(jakefile);
      const jakelibdirLoaded = loader.loadDirectory(jakelibdir);

      if (!jakefileLoaded && !jakelibdirLoaded && !jake.program.opts.autocomplete) {
        console.error('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
        process.exit(1);
      }

      jake.program.run();
    }
  };
}

module.exports = jake;
