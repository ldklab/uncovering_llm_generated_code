const debug = require('debug')('nodemon');
const path = require('path');
const monitor = require('./monitor');
const cli = require('./cli');
const version = require('./version');
const util = require('util');
const utils = require('./utils');
const bus = utils.bus;
const help = require('./help');
const config = require('./config');
const spawn = require('./spawn');
const defaults = require('./config/defaults');
let eventHandlers = {};

// Set configuration requirement flag
config.required = utils.isRequired;

function nodemon(settings) {
  bus.emit('boot');
  nodemon.reset();

  if (typeof settings === 'string') {
    settings = cli.parse(cli.prepareSettings(settings));
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  handleHelpOrVersion(settings);
  handleWorkingDirectory(settings);

  const cwd = process.cwd();

  config.load(settings, (config) => {
    if (shouldExitEarly(config)) return;

    utils.colours = config.options.colours;
    utils.log.info(version.pinned);

    logConfigDetails(config, cwd);

    if (config.options.stdin) {
      setupStdinHandling(config);
    }

    setupProcessSignals(config);

    logWatchingDetails(config, cwd);

    if (config.options.dump) {
      dumpConfiguration(config, cwd);
      return;
    }

    prepareNodemon(config);

    monitor.run(config.options);
  });

  return nodemon;
}

function handleHelpOrVersion(settings) {
  if (settings.help) {
    blockStdout(true);
    console.log(help(settings.help));
    exitIfNotRequired();
  } else if (settings.version) {
    version().then(v => {
      console.log(v);
      exitIfNotRequired();
    });
  }
}

function handleWorkingDirectory(settings) {
  if (settings.cwd && process.cwd() !== path.resolve(config.system.cwd, settings.cwd)) {
    process.chdir(settings.cwd);
  }
}

function shouldExitEarly(config) {
  return !config.options.dump && !config.options.execOptions.script && config.options.execOptions.exec === 'node' && exitWithUsage();
}

function exitWithUsage() {
  if (!config.required) {
    console.log(help('usage'));
    process.exit();
    return true;
  }
  return false;
}

function logConfigDetails(config, cwd) {
  utils.log.detail('process root: ' + cwd);

  config.loaded.map(file => file.replace(cwd, '.')).forEach(file => {
    utils.log.detail('reading config ' + file);
  });
}

function setupStdinHandling(config) {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  if (config.options.restartable) {
    process.stdin.on('data', data => {
      const str = data.toString().trim().toLowerCase();
      if (str === config.options.restartable) bus.emit('restart');
      else if (data.charCodeAt(0) === 12) console.clear();
    });
  } else {
    setupSignalHandlers();
  }

  if (process.stdin.setRawMode) process.stdin.setRawMode(true);
}

function setupSignalHandlers() {
  let ctrlC = false;
  process.stdin.on('data', function (data) {
    data = data.toString();
    if (data.charCodeAt(0) === 3) {
      if (ctrlC) process.exit(0);
      ctrlC = true;
    } else if (data === '.exit' || data.charCodeAt(0) === 4) {
      process.exit();
    }
    ctrlC = false;
  });
}

function setupProcessSignals(config) {
  logRestartableInfo(config);

  if (!config.required) {
    const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
    process.on(restartSignal, nodemon.restart);

    bus.on('error', () => { utils.log.fail((new Error().stack)); });
    utils.log.detail(config.options.restartable ? 'or ' : '' + `send ${restartSignal} to ${process.pid} to restart`);
  }
}

function logRestartableInfo(config) {
  if (config.options.restartable) {
    utils.log.info(`to restart at any time, enter \`${config.options.restartable}\``);
  }
}

function logWatchingDetails(config, cwd) {
  const ignoring = getIgnoringPaths(config, cwd);
  if (ignoring) utils.log.detail('ignoring: ' + ignoring);

  const watchingPaths = getWatchingPaths(config);
  utils.log.info('watching path(s): ' + watchingPaths);

  utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));
}

function getIgnoringPaths(config, cwd) {
  return config.options.monitor
    .filter(rule => rule[0] === '!')
    .map(rule => normalizeIgnoreRule(rule, cwd))
    .filter(Boolean)
    .join(' ');
}

function normalizeIgnoreRule(rule, cwd) {
  rule = rule.slice(1);
  if (defaults.ignoreRoot.includes(rule)) return false;
  return rule.startsWith(cwd) ? rule.replace(cwd, '.') : rule;
}

function getWatchingPaths(config) {
  return config.options.monitor
    .filter(rule => rule[0] !== '!')
    .map(rule => path.relative(process.cwd(), rule))
    .join(' ');
}

function dumpConfiguration(config, cwd) {
  utils.log._log('log', '--------------');
  utils.log._log('log', 'node: ' + process.version);
  utils.log._log('log', 'nodemon: ' + version.pinned);
  utils.log._log('log', 'command: ' + process.argv.join(' '));
  utils.log._log('log', 'cwd: ' + cwd);
  utils.log._log('log', `OS: ${process.platform}, ${process.arch}`);
  utils.log._log('log', '--------------');
  utils.log._log('log', util.inspect(config, { depth: null }));
  utils.log._log('log', '--------------');
  exitIfNotRequired();
}

function prepareNodemon(config) {
  config.run = true;
  if (config.options.stdout === false) {
    bus.emit('readable');
  }

  setupEventBindings(config);
}

function setupEventBindings(config) {
  if (config.options.events) {
    Object.keys(config.options.events).forEach(key => {
      utils.log.detail(`bind ${key} -> \`${config.options.events[key]}\``);
      nodemon.on(key, function () {
        spawn(config.options.events[key], config, Array.from(arguments));
      });
    });
  }
}

// Nodemon methods
nodemon.restart = function () {
  utils.log.status('restarting child process');
  bus.emit('restart');
  return nodemon;
};

nodemon.addListener = nodemon.on = function (event, handler) {
  eventHandlers[event] = eventHandlers[event] || [];
  eventHandlers[event].push(handler);
  bus.on(event, handler);
  return nodemon;
};

nodemon.once = function (event, handler) {
  eventHandlers[event] = eventHandlers[event] || [];
  eventHandlers[event].push(handler);
  bus.once(event, function () {
    debug(`bus.once(${event})`);
    removeFromEventHandlers(event, handler);
    handler.apply(this, arguments);
  });
  return nodemon;
};

function removeFromEventHandlers(event, handler) {
  let index = eventHandlers[event].indexOf(handler);
  if (index !== -1) eventHandlers[event].splice(index, 1);
}

nodemon.emit = function (...args) {
  bus.emit(...args);
  return nodemon;
};

nodemon.removeAllListeners = function (event) {
  Object.keys(eventHandlers)
    .filter(e => event ? e === event : true)
    .forEach(e => {
      eventHandlers[e].forEach(handler => {
        bus.removeListener(e, handler);
        removeFromEventHandlers(e, handler);
      });
    });

  return nodemon;
};

nodemon.reset = function (done) {
  bus.emit('reset', done);
};

bus.on('reset', function (done) {
  debug('reset');
  nodemon.removeAllListeners();
  monitor.run.kill(true, function () {
    utils.reset();
    config.reset();
    config.run = false;
    if (done) done();
  });
});

function blockStdout(block) {
  if (block && process.stdout.isTTY) {
    process.stdout._handle.setBlocking(block);
  }
}
function exitIfNotRequired() {
  if (!config.required) {
    process.exit(0);
  }
}

nodemon.config = config;

module.exports = nodemon;
