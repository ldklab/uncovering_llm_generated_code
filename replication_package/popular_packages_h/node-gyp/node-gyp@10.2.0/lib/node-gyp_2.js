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
    help: Boolean, arch: String, cafile: String,
    debug: Boolean, directory: String, make: String,
    'msvs-version': String, ensure: Boolean, solution: String,
    proxy: String, noproxy: String, devdir: String,
    nodedir: String, loglevel: String, python: String,
    'dist-url': String, tarball: String, jobs: String,
    thin: String, 'force-process-config': Boolean
  };

  shorthands = {
    release: '--no-debug', C: '--directory', debug: '--debug',
    j: '--jobs', silly: '--loglevel=silly',
    verbose: '--loglevel=verbose', silent: '--loglevel=silent'
  };

  aliases = {
    ls: 'list', rm: 'remove'
  };

  constructor(...args) {
    super(...args);

    this.devDir = '';
    this.commands = Object.fromEntries(
      commands.map(cmd => [cmd, argv => require(`./${cmd}`)(this, argv)])
    );

    Object.defineProperty(this, 'version', {
      enumerable: true,
      get: () => this.package.version
    });
  }

  parseArgv(argv) {
    this.opts = nopt(this.configDefs, this.shorthands, argv);
    this.argv = this.opts.argv.remain.slice();

    const commands = this.todo = [];
    argv = this.argv.map(arg => this.aliases[arg] || arg);
    argv.slice().forEach(arg => {
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
    Object.entries(process.env).forEach(([name, val]) => {
      if (!name.startsWith(npmConfigPrefix)) return;
      
      if (name === npmConfigPrefix + 'loglevel') {
        log.logger.level = val;
      } else {
        name = name.substring(npmConfigPrefix.length).replace(/_/g, '-');
        if (name) this.opts[name] = val;
      }
    });

    if (this.opts.loglevel) {
      log.logger.level = this.opts.loglevel;
    }
    log.resume();
  }

  spawn(command, args, opts = {}) {
    if (!opts.silent && !opts.stdio) {
      opts.stdio = [0, 1, 2];
    }
    const cp = childProcess.spawn(command, args, opts);
    log.info('spawn', command);
    log.info('spawn args', args);
    return cp;
  }

  usage() {
    return [
      '',
      '  Usage: node-gyp <command> [options]',
      '',
      '  where <command> is one of:',
      commands.map(c => `    - ${c} - ${require(`./${c}`).usage}`).join('\n'),
      '',
      `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
      `node@${process.versions.node}`
    ].join('\n');
  }
}

module.exports = () => new Gyp();
module.exports.Gyp = Gyp;
