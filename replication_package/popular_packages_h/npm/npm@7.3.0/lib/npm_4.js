const { EventEmitter } = require('events');
const { resolve, dirname } = require('path');
const Config = require('@npmcli/config');
require('graceful-fs').gracefulify(require('fs'));

const procLogListener = require('./utils/proc-log-listener.js');
const hasOwnProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const proxyCmds = (npm) => {
  const cmds = {};
  return new Proxy(cmds, {
    get: (prop, cmd) => {
      if (hasOwnProperty(cmds, cmd)) return cmds[cmd];
      const actual = deref(cmd);
      cmds[cmd] = cmds[actual] || (cmds[actual] = makeCmd(actual));
      return cmds[cmd];
    },
  });
};

const makeCmd = cmd => {
  const impl = require(`./${cmd}.js`);
  const fn = (args, cb) => npm[_runCmd](cmd, impl, args, cb);
  Object.assign(fn, impl);
  return fn;
};

const { types, defaults, shorthands } = require('./utils/config.js');
const _runCmd = Symbol('_runCmd');
const _load = Symbol('_load');
const _flatOptions = Symbol('_flatOptions');
const _title = Symbol('_title');

const npm = new class extends EventEmitter {
  constructor() {
    super();
    require('./utils/perf.js');
    this.modes = { exec: 0o755, file: 0o644, umask: 0o22 };
    this.started = Date.now();
    this.command = null;
    this.commands = proxyCmds(this);
    procLogListener();
    process.emit('time', 'npm');
    this.version = require('../package.json').version;
    this.config = new Config({
      npmPath: dirname(__dirname),
      types,
      defaults,
      shorthands,
    });
    this[_title] = process.title;
    this.updateNotification = null;
  }

  deref(c) {
    return deref(c);
  }

  [_runCmd](cmd, impl, args, cb) {
    if (!this.loaded) {
      throw new Error('Call npm.load(cb) before using this command.\n');
    }
    process.emit('time', `command:${cmd}`);
    if (!this.command) {
      process.env.npm_command = cmd;
      this.command = cmd;
    }

    if (!warnedNonDashArg) {
      args.filter(arg => /^[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.test(arg))
        .forEach(arg => {
          warnedNonDashArg = true;
          log.error('arg', 'Invalid argument with non-ASCII dash:', arg);
        });
    }

    if (this.config.get('usage')) {
      console.log(impl.usage);
      cb();
    } else {
      impl(args, er => {
        process.emit('timeEnd', `command:${cmd}`);
        cb(er);
      });
    }
  }

  load(cb) {
    if (typeof cb !== 'function') throw new TypeError('Use npm.load(callback)');
    this.once('load', cb);
    if (this.loaded || this.loadErr) {
      this.emit('load', this.loadErr);
      return;
    }
    if (this.loading) return;

    this.loading = true;
    process.emit('time', 'npm:load');
    this.log.pause();
    return this[_load]().catch(er => er).then(er => {
      this.loading = false;
      this.loadErr = er;
      if (!er && this.config.get('force')) this.log.warn('using --force', 'Protections disabled.');
      this[_flatOptions] = this[_flatOptions] || require('./utils/flat-options.js')(this);
      process.emit('timeEnd', 'npm:load');
      this.emit('load', er);
    });
  }

  get loaded() {
    return this.config.loaded;
  }

  get title() {
    return this[_title];
  }

  set title(t) {
    process.title = t;
    this[_title] = t;
  }

  async [_load]() {
    const node = await which(process.argv[0]).catch(() => null);
    if (node && node.toUpperCase() !== process.execPath.toUpperCase()) {
      log.verbose('node symlink', node);
      process.execPath = node;
    }
    this.config.execPath = node;
    await this.config.load();
    this.argv = this.config.parsedArgv.remain;

    const tokrev = deref(this.argv[0]) === 'token' && this.argv[1] === 'revoke';
    this.title = tokrev ? 'npm token revoke' + (this.argv[2] ? ' ***' : '') : ['npm', ...this.argv].join(' ');

    this.color = setupLog(this.config, this);
    process.env.COLOR = this.color ? '1' : '0';

    cleanUpLogFiles(this.cache, this.config.get('logs-max'), log.warn);
    log.resume();

    const umask = this.config.get('umask');
    this.modes = { exec: 0o777 & (~umask), file: 0o666 & (~umask), umask };
    const configScope = this.config.get('scope');
    if (configScope && !/^@/.test(configScope)) this.config.set('scope', `@${configScope}`, this.config.find('scope'));

    this.projectScope = getProjectScope(this.prefix) || this.config.get('scope');
  }

  get flatOptions() {
    return this[_flatOptions];
  }

  get lockfileVersion() {
    return 2;
  }

  get log() {
    return log;
  }

  get cache() {
    return this.config.get('cache');
  }

  set cache(r) {
    this.config.set('cache', r);
  }

  get globalPrefix() {
    return this.config.globalPrefix;
  }

  set globalPrefix(r) {
    this.config.globalPrefix = r;
  }

  get localPrefix() {
    return this.config.localPrefix;
  }

  set localPrefix(r) {
    this.config.localPrefix = r;
  }

  get globalDir() {
    const base = this.globalPrefix;
    return process.platform !== 'win32' ? resolve(base, 'lib', 'node_modules') : resolve(base, 'node_modules');
  }

  get localDir() {
    return resolve(this.localPrefix, 'node_modules');
  }

  get dir() {
    return this.config.get('global') ? this.globalDir : this.localDir;
  }

  get globalBin() {
    const binPath = this.globalPrefix;
    return process.platform !== 'win32' ? resolve(binPath, 'bin') : binPath;
  }

  get localBin() {
    return resolve(this.dir, '.bin');
  }

  get bin() {
    return this.config.get('global') ? this.globalBin : this.localBin;
  }

  get prefix() {
    return this.config.get('global') ? this.globalPrefix : this.localPrefix;
  }

  set prefix(r) {
    const key = this.config.get('global') ? 'globalPrefix' : 'localPrefix';
    this[key] = r;
  }

  get tmp() {
    if (!this[_tmpFolder]) {
      const rand = require('crypto').randomBytes(4).toString('hex');
      this[_tmpFolder] = `npm-${process.pid}-${rand}`;
    }
    return resolve(this.config.get('tmp'), this[_tmpFolder]);
  }
}();

const log = require('npmlog');
const { promisify } = require('util');
const which = promisify(require('which'));

const deref = require('./utils/deref-command.js');
const setupLog = require('./utils/setup-log.js');
const cleanUpLogFiles = require('./utils/cleanup-log-files.js');
const getProjectScope = require('./utils/get-project-scope.js');

if (require.main === module) require('./cli.js')(process);

module.exports = npm;
