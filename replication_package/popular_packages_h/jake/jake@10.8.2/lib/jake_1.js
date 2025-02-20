const fs = require('fs');
const chalk = require('chalk');
const { EventEmitter } = require('events');
const { Task, FileTask, DirectoryTask } = require('./task');
const { Rule } = require('./rule');
const { Namespace, RootNamespace } = require('./namespace');
const api = require('./api');
const utils = require('./utils');
const { Program } = require('./program');
const loader = require('./loader')();
const { FileList } = require('filelist');
const { PackageTask } = require('./package_task');
const { PublishTask } = require('./publish_task');
const { TestTask } = require('./test_task');

if (!global.jake) {
  global.jake = new EventEmitter();
  const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
  const MAX_RULE_RECURSION_LEVEL = 16;

  Object.assign(global, api);
  Object.assign(jake, utils.file, api, new (function () {
    Object.assign(this, {
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
      FileList,
      PackageTask,
      PublishTask,
      TestTask,
      Task,
      FileTask,
      DirectoryTask,
      Namespace,
      Rule,
      
      parseAllTasks() {
        const _parseNs = (ns) => {
          for (let q in ns.tasks) {
            jake.Task[ns.tasks[q].fullName] = ns.tasks[q];
          }
          for (let p in ns.childNamespaces) {
            _parseNs(ns.childNamespaces[p]);
          }
        };
        _parseNs(jake.defaultNamespace);
      },

      showAllTaskDescriptions(f) {
        let maxTaskNameLength = 0;
        for (let p in jake.Task) {
          if (Object.prototype.hasOwnProperty.call(jake.Task, p) && (!f || p.includes(f))) {
            maxTaskNameLength = Math.max(maxTaskNameLength, p.length);
          }
        }
        for (let p in jake.Task) {
          if (Object.prototype.hasOwnProperty.call(jake.Task, p) && (!f || p.includes(f))) {
            const task = jake.Task[p];
            if (task.description) {
              const name = chalk.green(p);
              const descr = chalk.gray('# ' + task.description);
              const padding = ' '.repeat(maxTaskNameLength - p.length + 2);
              console.log(`jake ${name}${padding}${descr}`);
            }
          }
        }
      },

      createTask() {
        const args = Array.from(arguments);
        const [type, ...rest] = args;
        let name, prereqs = [], action = null, opts = {};
        
        if (typeof rest[0] === 'string') {
          name = rest.shift();
          if (Array.isArray(rest[0])) prereqs = rest.shift();
        } else {
          const obj = rest.shift();
          for (let p in obj) {
            prereqs.push(...obj[p]);
            name = p;
          }
        }
        
        rest.forEach(arg => {
          if (typeof arg === 'function') action = arg;
          else opts = { ...arg };
        });

        let task = jake.currentNamespace.resolveTask(name);
        if (task && !action) {
          task.prereqs.push(...prereqs);
          return task;
        }

        const TaskConstructor = {
          directory: DirectoryTask,
          file: FileTask,
          default: Task
        }[type] || Task;

        task = new TaskConstructor(name, prereqs, action, opts);
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
        const [filePath, ...parsed] = name.split(':').reverse();
        let task = namespace.resolveTask(name);

        if (!task && fs.existsSync(filePath)) {
          task = new jake.FileTask(filePath);
          task.dummy = true;
          const ns = parsed.length ? namespace.resolveNamespace(parsed.reverse().join(':')) : namespace;
          ns.addTask(task);
          jake.Task[`${ns.path}:${filePath}`] = task;
        }

        return task;
      },

      run() {
        const args = Array.from(arguments);
        this.program.parseArgs(args);
        this.program.init();

        const preempt = this.program.firstPreemptiveOption();
        if (preempt) {
          preempt();
        } else {
          const opts = this.program.opts;
          if (opts.autocomplete && opts.jakefile === true) {
            process.stdout.write('no-complete');
            return;
          }

          const jakefileLoaded = loader.loadFile(opts.jakefile);
          const jakelibdirLoaded = loader.loadDirectory(opts.jakelibdir);
          if (!jakefileLoaded && !jakelibdirLoaded && !opts.autocomplete) {
            this.fail('No Jakefile. Specify a valid path with -f/--jakefile, or place one in the current directory.');
          }

          this.program.run();
        }
      }
    });

    jake.logger = utils.logger;
    jake.exec = utils.exec;
  })());
}

module.exports = jake;
