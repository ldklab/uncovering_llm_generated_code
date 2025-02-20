'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('npmlog');
const childProcess = require('child_process');
const EventEmitter = require('events');
const { inherits } = require('util');

const commands = ['build', 'clean', 'configure', 'rebuild', 'install', 'list', 'remove'];
const aliases = { ls: 'list', rm: 'remove' };

log.heading = 'gyp';

function gyp() {
  return new Gyp();
}

function Gyp() {
  EventEmitter.call(this);
  this.devDir = '';
  this.commands = {};

  commands.forEach(command => {
    this.commands[command] = (argv, callback) => {
      log.verbose('command', command, argv);
      return require(`./${command}`)(this, argv, callback);
    };
  });
}

inherits(Gyp, EventEmitter);

Gyp.prototype.package = require('../package.json');

Gyp.prototype.configDefs = {
  help: Boolean, arch: String, cafile: String, debug: Boolean, directory: String,
  make: String, msvs_version: String, ensure: Boolean, solution: String, proxy: String,
  noproxy: String, devdir: String, nodedir: String, loglevel: String, python: String,
  'dist-url': String, tarball: String, jobs: String, thin: String
};

Gyp.prototype.shorthands = {
  release: '--no-debug', C: '--directory', debug: '--debug', j: '--jobs',
  silly: '--loglevel=silly', verbose: '--loglevel=verbose', silent: '--loglevel=silent'
};

Gyp.prototype.aliases = aliases;

Gyp.prototype.parseArgv = function (argv) {
  this.opts = nopt(this.configDefs, this.shorthands, argv);
  this.argv = this.opts.argv.remain.slice();
  const commands = this.todo = [];

  this.argv = this.argv.map(arg => this.aliases[arg] || arg);

  this.argv.slice().forEach(arg => {
    if (arg in this.commands) {
      const args = this.argv.splice(0, this.argv.indexOf(arg));
      this.argv.shift();
      if (commands.length > 0) {
        commands[commands.length - 1].args = args;
      }
      commands.push({ name: arg, args: [] });
    }
  });
  if (commands.length > 0) {
    commands[commands.length - 1].args = this.argv.splice(0);
  }

  const npmConfigPrefix = 'npm_config_';
  Object.keys(process.env).forEach(name => {
    if (!name.startsWith(npmConfigPrefix)) return;

    const val = process.env[name];
    if (name === npmConfigPrefix + 'loglevel') {
      log.level = val;
    } else {
      const optionName = name.substring(npmConfigPrefix.length);
      if (optionName) {
        this.opts[optionName] = val;
      }
    }
  });

  if (this.opts.loglevel) {
    log.level = this.opts.loglevel;
  }
  log.resume();
};

Gyp.prototype.spawn = function (command, args, opts = {}) {
  if (!opts.silent && !opts.stdio) opts.stdio = [0, 1, 2];
  const cp = childProcess.spawn(command, args, opts);
  log.info('spawn', command);
  log.info('spawn args', args);
  return cp;
};

Gyp.prototype.usage = function () {
  return [
    '', '  Usage: node-gyp <command> [options]', '',
    '  where <command> is one of:',
    commands.map(c => `    - ${c} - ${require(`./${c}`).usage}`).join('\n'), '',
    `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
    `node@${process.versions.node}`
  ].join('\n');
};

Object.defineProperty(Gyp.prototype, 'version', {
  get() {
    return this.package.version;
  },
  enumerable: true
});

module.exports = gyp;
