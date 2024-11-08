'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('npmlog');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const { inherits } = require('util');

const commands = [
  'build',
  'clean',
  'configure',
  'rebuild',
  'install',
  'list',
  'remove'
];

const aliases = {
  ls: 'list',
  rm: 'remove'
};

log.heading = 'gyp';

function gyp() {
  return new Gyp();
}

function Gyp() {
  EventEmitter.call(this);
  this.devDir = '';
  this.commands = {};

  commands.forEach((command) => {
    this.commands[command] = (argv, callback) => {
      log.verbose('command', command, argv);
      return require('./' + command)(this, argv, callback);
    };
  });
}
inherits(Gyp, EventEmitter);

exports.Gyp = Gyp;
const proto = Gyp.prototype;

proto.package = require('../package.json');

proto.configDefs = {
  help: Boolean,
  arch: String,
  cafile: String,
  debug: Boolean,
  directory: String,
  make: String,
  msvs_version: String,
  ensure: Boolean,
  solution: String,
  proxy: String,
  noproxy: String,
  devdir: String,
  nodedir: String,
  loglevel: String,
  python: String,
  'dist-url': String,
  tarball: String,
  jobs: String,
  thin: String
};

proto.shorthands = {
  release: '--no-debug',
  C: '--directory',
  debug: '--debug',
  j: '--jobs',
  silly: '--loglevel=silly',
  verbose: '--loglevel=verbose',
  silent: '--loglevel=silent'
};

proto.aliases = aliases;

proto.parseArgv = function parseOpts(argv) {
  this.opts = nopt(this.configDefs, this.shorthands, argv);
  this.argv = this.opts.argv.remain.slice();
  const commands = this.todo = [];

  argv = this.argv.map(arg => this.aliases[arg] || arg);

  argv.slice().forEach((arg) => {
    if (arg in this.commands) {
      const args = argv.splice(0, argv.indexOf(arg));
      argv.shift();
      if (commands.length > 0) {
        commands[commands.length - 1].args = args;
      }
      commands.push({ name: arg, args: [] });
    }
  });
  if (commands.length > 0) {
    commands[commands.length - 1].args = argv.splice(0);
  }

  const npmConfigPrefix = 'npm_config_';
  Object.keys(process.env).forEach((name) => {
    if (name.startsWith(npmConfigPrefix)) {
      const val = process.env[name];
      if (name === npmConfigPrefix + 'loglevel') {
        log.level = val;
      } else {
        const optionName = name.substring(npmConfigPrefix.length);
        if (optionName) {
          this.opts[optionName] = val;
        }
      }
    }
  });

  if (this.opts.loglevel) {
    log.level = this.opts.loglevel;
  }
  log.resume();
};

proto.spawn = function(command, args, opts = {}) {
  if (!opts.silent && !opts.stdio) {
    opts.stdio = 'inherit';
  }
  const cp = spawn(command, args, opts);
  log.info('spawn', command);
  log.info('spawn args', args);
  return cp;
};

proto.usage = function() {
  const commandHelp = commands.map(c => `    - ${c} - ${require('./' + c).usage}`).join('\n');
  return [
    '',
    '  Usage: node-gyp <command> [options]',
    '',
    '  where <command> is one of:',
    commandHelp,
    '',
    `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
    `node@${process.versions.node}`
  ].join('\n');
};

Object.defineProperty(proto, 'version', {
  get: function() {
    return this.package.version;
  },
  enumerable: true
});

module.exports = gyp;
