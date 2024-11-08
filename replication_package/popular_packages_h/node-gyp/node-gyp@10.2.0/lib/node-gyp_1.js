'use strict';

const path = require('path');
const nopt = require('nopt');
const log = require('./log');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const availableCommands = [
  'build', 'clean', 'configure', 'rebuild', 'install', 'list', 'remove'
];

class Gyp extends EventEmitter {
  constructor() {
    super();
    this.packageInfo = require('../package.json');
    this.devDir = '';
    this.configDefs = this.initializeConfigDefs();
    this.shorthands = this.initializeShorthands();
    this.aliases = this.initializeAliases();
    this.commands = this.setupCommands();
    this.commandList = [];
    
    Object.defineProperty(this, 'version', {
      get: () => this.packageInfo.version,
      enumerable: true
    });
  }

  initializeConfigDefs() {
    return {
      help: Boolean, arch: String, cafile: String, debug: Boolean,
      directory: String, make: String, 'msvs-version': String,
      ensure: Boolean, solution: String, proxy: String, noproxy: String,
      devdir: String, nodedir: String, loglevel: String, python: String,
      'dist-url': String, tarball: String, jobs: String, thin: String,
      'force-process-config': Boolean
    };
  }

  initializeShorthands() {
    return {
      release: '--no-debug', C: '--directory', debug: '--debug',
      j: '--jobs', silly: '--loglevel=silly', verbose: '--loglevel=verbose',
      silent: '--loglevel=silent'
    };
  }

  initializeAliases() {
    return {
      ls: 'list', rm: 'remove'
    };
  }

  setupCommands() {
    return availableCommands.reduce((cmds, cmd) => {
      cmds[cmd] = (argv) => require('./' + cmd)(this, argv);
      return cmds;
    }, {});
  }

  parseArgv(argv) {
    this.opts = nopt(this.configDefs, this.shorthands, argv);
    this.argv = this.opts.argv.remain.slice();
    const mappedArgs = this.argv.map(arg => this.aliases[arg] || arg);
    this.processCommands(mappedArgs);
    this.setEnvironmentConfig();
    this.setLogLevel();
  }

  processCommands(args) {
    args.slice().forEach((arg) => {
      if (arg in this.commands) {
        const cmdArgs = args.splice(0, args.indexOf(arg));
        args.shift();

        if (this.commandList.length > 0) {
          this.commandList[this.commandList.length - 1].args = cmdArgs;
        }
        this.commandList.push({ name: arg, args: [] });
      }
    });
    if (this.commandList.length > 0) {
      this.commandList[this.commandList.length - 1].args = args.splice(0);
    }
  }

  setEnvironmentConfig() {
    Object.keys(process.env).forEach((name) => {
      if (name.startsWith('npm_config_')) {
        const val = process.env[name];
        if (name.includes('loglevel')) {
          log.logger.level = val;
        } else {
          const configName = name.slice(11).replace(/_/g, '-');
          if (configName) {
            this.opts[configName] = val;
          }
        }
      }
    });
  }

  setLogLevel() {
    if (this.opts.loglevel) {
      log.logger.level = this.opts.loglevel;
    }
    log.resume();
  }

  spawn(command, args, options = {}) {
    if (!options.silent && !options.stdio) {
      options.stdio = 'inherit';
    }
    const spawnedProcess = spawn(command, args, options);
    log.info('spawn', command, 'args', args);
    return spawnedProcess;
  }

  usage() {
    return [
      '',
      '  Usage: node-gyp <command> [options]',
      '',
      `  where <command> is one of:`,
      availableCommands.map(cmd => `    - ${cmd} - ${require('./' + cmd).usage}`).join('\n'),
      '',
      `node-gyp@${this.version}  ${path.resolve(__dirname, '..')}`,
      `node@${process.versions.node}`
    ].join('\n');
  }
}

module.exports = () => new Gyp();
module.exports.Gyp = Gyp;
