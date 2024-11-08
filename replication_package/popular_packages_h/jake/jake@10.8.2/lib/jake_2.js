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
const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));

// Constants
const MAX_RULE_RECURSION_LEVEL = 16;

// Initialize global `jake` if not defined
if (!global.jake) {
  global.jake = new EventEmitter();
  
  // Globalize API methods and utils
  Object.assign(global, api);
  Object.assign(jake, api, utils.file);
  jake.logger = utils.logger;
  jake.exec = utils.exec;

  // Assign top-level properties to `jake`
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
    Task: taskNs.Task,
    FileTask: taskNs.FileTask,
    DirectoryTask: taskNs.DirectoryTask,
    Namespace,
    Rule,

    parseAllTasks() {
      const parseNamespace = (ns) => {
        Object.values(ns.tasks).forEach(task => {
          jake.Task[task.fullName] = task;
        });
        Object.values(ns.childNamespaces).forEach(parseNamespace);
      };
      parseNamespace(jake.defaultNamespace);
    },

    showAllTaskDescriptions(filter = null) {
      let maxTaskNameLength = 0;
      Object.entries(jake.Task).forEach(([name, task]) => {
        if (task.description && (!filter || name.includes(filter))) {
          maxTaskNameLength = Math.max(name.length, maxTaskNameLength);
        }
      });
      Object.entries(jake.Task).forEach(([name, task]) => {
        if (task.description && (!filter || name.includes(filter))) {
          const padding = ' '.repeat(maxTaskNameLength - name.length + 2);
          console.log(`jake ${chalk.green(name)}${padding}${chalk.gray('# ' + task.description)}`);
        }
      });
    },

    createTask(...args) {
      let [type, name, prereqs, action, opts] = [null, null, [], null, {}];
      type = args.shift();
      if (typeof args[0] === 'string') {
        name = args.shift();
        if (Array.isArray(args[0])) prereqs = args.shift();
      } else {
        const obj = args.shift();
        [[name, prereqs]] = Object.entries(obj);
      }
      const additional = args.shift();
      if (typeof additional === 'function') action = additional;
      else opts = { ...additional };

      let task = jake.currentNamespace.resolveTask(name);
      if (task && !action) {
        task.prereqs.push(...prereqs);
        return task;
      }

      switch (type) {
        case 'directory':
          action = () => jake.mkdirP(name);
          task = new taskNs.DirectoryTask(name, prereqs, action, opts);
          break;
        case 'file':
          task = new taskNs.FileTask(name, prereqs, action, opts);
          break;
        default:
          task = new taskNs.Task(name, prereqs, action, opts);
      }
      jake.currentNamespace.addTask(task);

      if (jake.currentTaskDescription) {
        task.description = jake.currentTaskDescription;
        jake.currentTaskDescription = null;
      }

      jake.parseAllTasks();
      return task;
    },

    attemptRule(name, ns, level) {
      if (level > MAX_RULE_RECURSION_LEVEL) return null;
      const prereqRule = ns.matchRule(name);
      return prereqRule ? prereqRule.createTask(name, level) : null;
    },

    createPlaceholderFileTask(name, namespace) {
      const parsed = name.split(':');
      const filePath = parsed.pop();
      let task = namespace.resolveTask(name);
      if (!task && fs.existsSync(filePath)) {
        task = new jake.FileTask(filePath);
        task.dummy = true;
        const ns = parsed.length ? namespace.resolveNamespace(parsed.join(':')) : namespace;
        if (!ns) throw new Error('Invalid namespace, cannot add FileTask');
        ns.addTask(task);
        jake.Task[`${ns.path}:${filePath}`] = task;
      }
      return task || null;
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
          fail('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
        }

        program.run();
      }
    }
  });
}

module.exports = jake;
