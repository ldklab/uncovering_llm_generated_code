'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('./log');
const childProcess = require('child_process');
const { EventEmitter } = require('events');

const commands = ['build', 'clean', 'configure', 'rebuild', 'install', 'list', 'remove'];

class Gyp extends EventEmitter {
  constructor(...args) {
    super(...args);
    this.package = require('../package.json');
    this.devDir = '';
    this.commands = commands.reduce((acc, command) => {
      acc[command] = (argv) => require('./' + command)(this, argv);
      return acc;
    }, {});
    this.configDefs = {
      help: Boolean, arch: String, cafile: String, debug: Boolean, directory: String,
      make: String, 'msvs-version': String, ensure: Boolean, solution: String,
      proxy: String, noproxy: String, devdir: String, nodedir: String, loglevel: String,
      python: String, 'dist-url': String, tarball: String, jobs: String, thin: String,
      'force-process-config': Boolean
    };
    this.shorthands = {
      release: '--no-debug', C: '--directory', debug: '--debug',
      j: '--jobs', silly: '--loglevel=silly', verbose: '--loglevel=verbose',
      silent: '--loglevel=silent'
    };
    this.aliases = {
      ls: 'list',
      rm: 'remove'
    };
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
    Object.keys(process.env).forEach(name => {
      if (name.startsWith(npmConfigPrefix)) {
        const val = process.env[name];
        const optName = name.substring(npmConfigPrefix.length).replace(/_/g, '-');
        if (optName) {
          this.opts[optName] = val;
        }
      }
    });

    if (this.opts.loglevel) {
      log.logger.level = this.opts.loglevel;
    }
    log.resume();
  }

  spawn(command, args, opts) {
    opts = opts || {};
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
      commands.map(c => '    - ' + c + ' - ' + require('./' + c).usage).join('\n'),
      '',
      'node-gyp@' + this.version + '  ' + path.resolve(__dirname, '..'),
      'node@' + process.versions.node
    ].join('\n');
  }
}

module.exports = () => new Gyp();
module.exports.Gyp = Gyp;
