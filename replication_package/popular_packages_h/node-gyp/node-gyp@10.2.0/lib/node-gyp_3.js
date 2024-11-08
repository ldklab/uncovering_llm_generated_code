'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('./log');
const childProcess = require('child_process');
const { EventEmitter } = require('events');

const commands = [
  'build', 'clean', 'configure', 'rebuild', 
  'install', 'list', 'remove'
];

class Gyp extends EventEmitter {
  package = require('../package.json');

  configDefs = {
    help: Boolean, arch: String, cafile: String, debug: Boolean, 
    directory: String, make: String, 'msvs-version': String, 
    ensure: Boolean, solution: String, proxy: String, noproxy: String, 
    devdir: String, nodedir: String, loglevel: String, python: String, 
    'dist-url': String, tarball: String, jobs: String, thin: String, 
    'force-process-config': Boolean
  };

  shorthands = {
    release: '--no-debug', C: '--directory', debug: '--debug', 
    j: '--jobs', silly: '--loglevel=silly', 
    verbose: '--loglevel=verbose', silent: '--loglevel=silent'
  };

  aliases = { ls: 'list', rm: 'remove' };

  constructor(...args) {
    super(...args);
    this.devDir = '';

    this.commands = commands.reduce((acc, cmd) => (acc[cmd] = this.loadCommand(cmd), acc), {});

    Object.defineProperty(this, 'version', { enumerable: true, get: () => this.package.version });
  }

  loadCommand(cmd) {
    return (argv) => require(`./${cmd}`)(this, argv);
  }

  parseArgv(argv) {
    this.opts = nopt(this.configDefs, this.shorthands, argv);
    this.argv = this.opts.argv.remain.slice();

    this.todo = [];
    const expandedArgv = this.argv.map(arg => this.aliases[arg] || arg);

    expandedArgv.slice().forEach(arg => {
      if (this.commands[arg]) {
        const args = expandedArgv.splice(0, expandedArgv.indexOf(arg));
        expandedArgv.shift();
        if (this.todo.length) this.todo.at(-1).args = args;
        this.todo.push({ name: arg, args: [] });
      }
    });

    if (this.todo.length) this.todo.at(-1).args = expandedArgv.splice(0);

    for (const [name, val] of Object.entries(process.env)) {
      if (name.startsWith('npm_config_')) {
        const optName = name.substring(11).replace(/_/g, '-');
        if (optName) this.opts[optName] = val;
      }
    }

    if (this.opts.loglevel) log.logger.level = this.opts.loglevel;
    log.resume();
  }

  spawn(command, args, opts = {}) {
    opts.stdio = opts.silent ? 'ignore' : [0, 1, 2];
    const cp = childProcess.spawn(command, args, opts);
    log.info('spawn', command);
    log.info('spawn args', args);
    return cp;
  }

  usage() {
    return [
      '', '  Usage: node-gyp <command> [options]', '', 
      '  where <command> is one of:', 
      commands.map(c => `    - ${c} - ${require(`./${c}`).usage}`).join('\n'), '', 
      `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
      `node@${process.versions.node}`
    ].join('\n');
  }
}

module.exports = () => new Gyp();
module.exports.Gyp = Gyp;
