'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('npmlog');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const { inherits } = require('util');

const commands = ['build', 'clean', 'configure', 'rebuild', 'install', 'list', 'remove'];
const aliases = { ls: 'list', rm: 'remove' };

// Set custom log heading for node-gyp
log.heading = 'gyp';

class Gyp extends EventEmitter {
  constructor() {
    super();
    this.devDir = '';
    this.commands = Object.create(null);

    commands.forEach(command => {
      this.commands[command] = (argv, callback) => {
        log.verbose('command', command, argv);
        return require(`./${command}`)(this, argv, callback);
      };
    });
  }

  get version() {
    return require('../package.json').version;
  }

  static get npmConfigPrefix() {
    return 'npm_config_';
  }

  parseArgv(argv) {
    this.opts = nopt(this.configDefs, this.shorthands, argv);
    this.argv = this.opts.argv.remain.slice();
    this.todo = [];

    const parsedArgs = this.argv.map(arg => this.aliases[arg] || arg);
    
    parsedArgs.slice().forEach((arg, index) => {
      if (arg in this.commands) {
        const args = parsedArgs.splice(0, index);
        parsedArgs.shift();
        if (this.todo.length) {
          this.todo[this.todo.length - 1].args = args;
        }
        this.todo.push({ name: arg, args: [] });
      }
    });

    if (this.todo.length) {
      this.todo[this.todo.length - 1].args = parsedArgs.splice(0);
    }

    Object.keys(process.env).forEach(name => {
      if (name.startsWith(Gyp.npmConfigPrefix)) {
        const envVar = process.env[name];
        const key = name.substring(Gyp.npmConfigPrefix.length);
        if (key === 'loglevel') {
          log.level = envVar;
        } else if (key) {
          this.opts[key] = envVar;
        }
      }
    });

    if (this.opts.loglevel) {
      log.level = this.opts.loglevel;
    }

    log.resume();
  }

  spawn(command, args, opts = { stdio: [0, 1, 2] }) {
    const cp = spawn(command, args, opts);
    log.info('spawn', command);
    log.info('spawn args', args);
    return cp;
  }

  usage() {
    const commandDescriptions = commands.map(cmd => `    - ${cmd} - ${require(`./${cmd}`).usage}`).join('\n');
    return [
      '',
      '  Usage: node-gyp <command> [options]',
      '',
      '  where <command> is one of:',
      commandDescriptions,
      '',
      `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
      `node@${process.versions.node}`,
    ].join('\n');
  }
}

Gyp.prototype.package = require('../package.json');
Gyp.prototype.configDefs = {
  help: Boolean, arch: String, cafile: String, debug: Boolean,
  directory: String, make: String, msvs_version: String, ensure: Boolean,
  solution: String, proxy: String, noproxy: String, devdir: String,
  nodedir: String, loglevel: String, python: String, 'dist-url': String,
  tarball: String, jobs: String, thin: String
};
Gyp.prototype.shorthands = {
  release: '--no-debug', C: '--directory', debug: '--debug',
  j: '--jobs', silly: '--loglevel=silly', verbose: '--loglevel=verbose',
  silent: '--loglevel=silent'
};
Gyp.prototype.aliases = aliases;

module.exports = () => new Gyp();
