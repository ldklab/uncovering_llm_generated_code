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

config.required = utils.isRequired;

function nodemon(settings) {
  bus.emit('boot');
  nodemon.reset();

  if (typeof settings === 'string') {
    settings = parseSettingsString(settings);
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  handleHelpAndVersion(settings);

  if (settings.cwd) ensureCorrectCwd(settings.cwd);

  const cwd = process.cwd();

  config.load(settings, function (config) {
    handleConfigLoad(config, cwd);

    if (config.options.stdin) {
      setupStdin(config.options);
    }

    if (config.options.restartable) {
      logRestartInfo(config);
    }

    logMonitoringInfo(config, cwd);

    if (config.options.dump) {
      dumpConfigInfo(config, cwd);
      if (!config.required) process.exit();
      return;
    }

    config.run = true;

    manageOutput(config);

    setupEventBindings(config);

    monitor.run(config.options);
  });

  return nodemon;
}

function parseSettingsString(settings) {
  settings = settings.trim();
  if (!settings.startsWith('node')) {
    if (!settings.startsWith('nodemon')) {
      settings = 'nodemon ' + settings;
    }
    settings = 'node ' + settings;
  }
  return cli.parse(settings);
}

function handleHelpAndVersion(settings) {
  if (settings.help) {
    ensureBlockingStdout();
    console.log(help(settings.help));
    if (!config.required) process.exit(0);
  }

  if (settings.version) {
    version().then(v => {
      console.log(v);
      if (!config.required) process.exit(0);
    });
  }
}

function ensureBlockingStdout() {
  process.stdout._handle.setBlocking(true);
}

function ensureCorrectCwd(newCwd) {
  if (process.cwd() !== path.resolve(config.system.cwd, newCwd)) {
    process.chdir(newCwd);
  }
}

function handleConfigLoad(config, cwd) {
  if (!config.options.dump && !config.options.execOptions.script &&
      config.options.execOptions.exec === 'node') {
    if (!config.required) {
      console.log(help('usage'));
      process.exit();
    }
    return;
  }

  utils.colours = config.options.colours;
  utils.log.info(version.pinned);

  logProcessRoot(config, cwd);

  config.loaded.map(file => file.replace(cwd, '.'))
               .forEach(file => utils.log.detail('reading config ' + file));
}

function setupStdin(options) {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', data => handleStdinData(data, options.restartable));
  
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

function handleStdinData(data, restartable) {
  const str = data.toString().trim().toLowerCase();

  if (str === restartable) {
    bus.emit('restart');
  } else if (data.charCodeAt(0) === 12) {
    console.clear();
  }
}

function logRestartInfo(config) {
  utils.log.info('to restart at any time, enter `' + config.options.restartable + '`');
}

function logMonitoringInfo(config, cwd) {
  const ignoring = config.options.monitor
    .map(rule => getIgnoreRule(rule, cwd))
    .filter(Boolean)
    .join(' ');
  if (ignoring) utils.log.detail('ignoring: ' + ignoring);

  utils.log.info('watching path(s): ' + config.options.monitor
    .map(rule => getWatchPath(rule, cwd))
    .filter(Boolean)
    .join(' '));

  utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));
}

function getIgnoreRule(rule, cwd) {
  if (rule.startsWith('!')) {
    rule = rule.slice(1);
    if (defaults.ignoreRoot.indexOf(rule) === -1) {
      return rule.startsWith(cwd) ? rule.replace(cwd, '.') : rule;
    }
  }
  return false;
}

function getWatchPath(rule, cwd) {
  if (!rule.startsWith('!')) {
    try {
      return path.relative(cwd, rule);
    } catch (e) { }
  }
  return false;
}

function dumpConfigInfo(config, cwd) {
  utils.log._log('log', '--------------');
  utils.log._log('log', 'node: ' + process.version);
  utils.log._log('log', 'nodemon: ' + version.pinned);
  utils.log._log('log', 'command: ' + process.argv.join(' '));
  utils.log._log('log', 'cwd: ' + cwd);
  utils.log._log('log', ['OS:', process.platform, process.arch].join(' '));
  utils.log._log('log', '--------------');
  utils.log._log('log', util.inspect(config, { depth: null }));
  utils.log._log('log', '--------------');
}

function manageOutput(config) {
  if (config.options.stdout === false) {
    nodemon.on('start', function() {
      nodemon.stdout = bus.stdout;
      nodemon.stderr = bus.stderr;
      bus.emit('readable');
    });
  }
}

function setupEventBindings(config) {
  if (config.options.events && Object.keys(config.options.events).length) {
    Object.keys(config.options.events).forEach(key => {
      utils.log.detail(`bind ${key} -> \`${config.options.events[key]}\``);
      nodemon.on(key, function () {
        if (config.options && config.options.events) {
          spawn(config.options.events[key], config, [].slice.call(arguments));
        }
      });
    });
  }
}

nodemon.restart = function() {
  utils.log.status('restarting child process');
  bus.emit('restart');
  return nodemon;
};

nodemon.addListener = nodemon.on = function(event, handler) {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  bus.on(event, handler);
  return nodemon;
};

nodemon.once = function(event, handler) {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  bus.once(event, function() {
    debug('bus.once(%s)', event);
    eventHandlers[event].splice(eventHandlers[event].indexOf(handler), 1);
    handler.apply(this, arguments);
  });
  return nodemon;
};

nodemon.emit = function() {
  bus.emit.apply(bus, [].slice.call(arguments));
  return nodemon;
};

nodemon.removeAllListeners = function(event) {
  Object.keys(eventHandlers).filter(e => event ? e === event : true)
    .forEach(event => {
      eventHandlers[event].forEach(handler => {
        bus.removeListener(event, handler);
        eventHandlers[event].splice(eventHandlers[event].indexOf(handler), 1);
      });
    });
  return nodemon;
};

nodemon.reset = function(done) {
  bus.emit('reset', done);
};

bus.on('reset', (done) => {
  debug('reset');
  nodemon.removeAllListeners();
  monitor.run.kill(true, () => {
    utils.reset();
    config.reset();
    config.run = false;
    if (done) done();
  });
});

nodemon.config = config;

module.exports = nodemon;
