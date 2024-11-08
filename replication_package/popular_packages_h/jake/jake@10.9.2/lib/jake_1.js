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

if (!global.jake) {
  global.jake = new EventEmitter();
  
  let { Task, FileTask, DirectoryTask } = taskNs;
  let pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
  
  const MAX_RULE_RECURSION_LEVEL = 16;
  Object.assign(global, api);
  Object.assign(jake, utils, utils.file, api);

  jake.logger = utils.logger;
  jake.exec = utils.exec;

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
    const parseNs = (ns) => {
      for (let nsTask of Object.values(ns.tasks)) {
        jake.Task[nsTask.fullName] = nsTask;
      }
      for (let nsNamespace of Object.values(ns.childNamespaces)) {
        parseNs(nsNamespace);
      }
    };
    parseNs(jake.defaultNamespace);
  };

  jake.showAllTaskDescriptions = function (filter) {
    filter = typeof filter === 'string' ? filter : null;
    let maxTaskNameLength = 0;
    for (let [name, task] of Object.entries(jake.Task)) {
      if (!Object.prototype.hasOwnProperty.call(jake.Task, name) || (filter && name.indexOf(filter) === -1)) continue;
      if (task.description) {
        maxTaskNameLength = Math.max(maxTaskNameLength, name.length + task.params.length);
      }
    }
    for (let [name, task] of Object.entries(jake.Task)) {
      if (!Object.prototype.hasOwnProperty.call(jake.Task, name) || (filter && name.indexOf(filter) === -1)) continue;
      if (task.description) {
        const taskParams = task.params ? `[${task.params}]` : "";
        const padding = ' '.repeat(maxTaskNameLength - name.length - taskParams.length + 4);
        console.log(`jake ${chalk.green(name)}${taskParams}${padding}${chalk.gray('# ' + task.description)}`);
      }
    }
  };

  jake.createTask = function (type, ...args) {
    let name, prereqs = [], action, opts = Object.create(null);
    if (typeof args[0] === 'string') {
      name = args.shift();
      if (Array.isArray(args[0])) prereqs = args.shift();
    } else {
      const obj = args.shift();
      [name] = Object.keys(obj);
      prereqs = prereqs.concat(obj[name]);
    }
    for (let arg of args) {
      if (typeof arg === 'function') action = arg;
      else Object.assign(opts, arg);
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
    const prereqRule = ns.matchRule(name);
    return prereqRule ? prereqRule.createTask(name, level) : null;
  };

  jake.createPlaceholderFileTask = function (name, namespace) {
    const parsed = name.split(':');
    const filePath = parsed.pop();
    let task = namespace.resolveTask(name);
    if (!task && fs.existsSync(filePath)) {
      task = new jake.FileTask(filePath);
      task.dummy = true;
      const nsPath = parsed.join(':');
      const ns = nsPath ? namespace.resolveNamespace(nsPath) : namespace;
      if (!ns) throw new Error('Invalid namespace, cannot add FileTask');
      ns.addTask(task);
      jake.Task[`${ns.path}:${filePath}`] = task;
    }
    return task;
  };

  jake.run = function (...args) {
    const program = jake.program;
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
      const hasJakefile = loader.loadFile(opts.jakefile);
      const hasJakelibdir = loader.loadDirectory(opts.jakelibdir);
      if (!hasJakefile && !hasJakelibdir && !opts.autocomplete) {
        fail('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
      }
      program.run();
    }
  };
}

module.exports = jake;
