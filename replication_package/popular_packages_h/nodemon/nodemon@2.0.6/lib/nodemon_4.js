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

// Ensure required configuration
config.required = utils.isRequired;

function nodemon(settings) {
  bus.emit('boot');
  nodemon.reset();

  if (typeof settings === 'string') {
    settings = prepareSettings(settings);
    settings = cli.parse(settings);
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  if (settings.help) {
    displayHelp(settings.help);
    return;
  }

  if (settings.version) {
    displayVersion();
    return;
  }

  handleCwd(settings);

  config.load(settings, (config) => {
    if (shouldExit(config)) {
      process.exit();
      return;
    }

    logVersionAndConfig(config);

    if (config.options.stdin) {
      setupManualRestart(config);
    }

    setupEventHandlers(config);

    monitor.run(config.options);
  });

  return nodemon;
}

function prepareSettings(settings) {
  settings = settings.trim();
  if (!settings.startsWith('node')) {
    if (!settings.startsWith('nodemon')) {
      settings = 'nodemon ' + settings;
    }
    settings = 'node ' + settings;
  }
  return settings;
}

function displayHelp(helpType) {
  process.stdout._handle.setBlocking(true);
  console.log(help(helpType));
  if (!config.required) {
    process.exit(0);
  }
}

function displayVersion() {
  version().then((v) => {
    console.log(v);
    if (!config.required) {
      process.exit(0);
    }
  });
}

function handleCwd(settings) {
  if (settings.cwd) {
    const desiredCwd = path.resolve(config.system.cwd, settings.cwd);
    if (process.cwd() !== desiredCwd) {
      process.chdir(settings.cwd);
    }
  }
}

function shouldExit(config) {
  return !config.options.dump && !config.options.execOptions.script
    && config.options.execOptions.exec === 'node' && !config.required;
}

function logVersionAndConfig(config) {
  utils.colours = config.options.colours;

  utils.log.info(version.pinned);

  const cwd = process.cwd();

  if (config.options.cwd) {
    utils.log.detail('process root: ' + cwd);
  }

  config.loaded.map(file => file.replace(cwd, '.')).forEach(file => {
    utils.log.detail('reading config ' + file);
  });

  utils.log.info('watching path(s): ' + formatWatchPaths(config));
  utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));

  if (config.options.dump) {
    dumpConfig(config, cwd);
  }
}

function formatWatchPaths(config) {
  return config.options.monitor.map(rule => {
    if (!rule.startsWith('!')) {
      try {
        return path.relative(process.cwd(), rule);
      } catch (e) {}
    }
    return false;
  }).filter(Boolean).join(' ');
}

function dumpConfig(config, cwd) {
  utils.log._log('log', '--------------');
  utils.log._log('log', 'node: ' + process.version);
  utils.log._log('log', 'nodemon: ' + version.pinned);
  utils.log._log('log', 'command: ' + process.argv.join(' '));
  utils.log._log('log', 'cwd: ' + cwd);
  utils.log._log('log', ['OS:', process.platform, process.arch].join(' '));
  utils.log._log('log', '--------------');
  utils.log._log('log', util.inspect(config, { depth: null }));
  utils.log._log('log', '--------------');
  if (!config.required) {
    process.exit();
  }
}

function setupManualRestart(config) {
  if (config.options.restartable) {
    setupRestartOnInput(config);
  } else {
    setupNonRestartableInput();
  }
}

function setupRestartOnInput(config) {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', data => {
    const str = data.toString().trim().toLowerCase();
    if (str === config.options.restartable) {
      bus.emit('restart');
    } else if (data.charCodeAt(0) === 12) {
      console.clear();
    }
  });
}

function setupNonRestartableInput() {
  let ctrlC = false;
  let buffer = '';

  process.stdin.on('data', data => {
    data = data.toString();
    buffer += data;
    const chr = data.charCodeAt(0);

    if (chr === 3) {
      handleCtrlC();
      return;
    } else if (buffer === '.exit' || chr === 4) {
      process.exit();
    } else if (chr === 13 || chr === 10) {
      buffer = '';
    } else if (chr === 12) {
      console.clear();
      buffer = '';
    }
    ctrlC = false;
  });

  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

function handleCtrlC() {
  if (ctrlC) {
    process.exit(0);
  }
  ctrlC = true;
}

function setupEventHandlers(config) {
  if (config.options.events && Object.keys(config.options.events).length) {
    Object.keys(config.options.events).forEach(key => {
      utils.log.detail('bind ' + key + ' -> `' + config.options.events[key] + '`');
      nodemon.on(key, () => {
        spawn(config.options.events[key], config, [].slice.apply(arguments));
      });
    });
  }

  if (!config.required) {
    const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
    process.on(restartSignal, nodemon.restart);
    utils.bus.on('error', () => {
      utils.log.fail((new Error().stack));
    });
    utils.log.detail((config.options.restartable ? 'or ' : '') + 'send ' +
      restartSignal + ' to ' + process.pid + ' to restart');
  }
}

nodemon.restart = function () {
  utils.log.status('restarting child process');
  bus.emit('restart');
  return nodemon;
};

nodemon.addListener = nodemon.on = function (event, handler) {
  if (!eventHandlers[event]) { eventHandlers[event] = []; }
  eventHandlers[event].push(handler);
  bus.on(event, handler);
  return nodemon;
};

nodemon.once = function (event, handler) {
  if (!eventHandlers[event]) { eventHandlers[event] = []; }
  eventHandlers[event].push(handler);
  bus.once(event, function () {
    debug('bus.once(%s)', event);
    eventHandlers[event].splice(eventHandlers[event].indexOf(handler), 1);
    handler.apply(this, arguments);
  });
  return nodemon;
};

nodemon.emit = function () {
  bus.emit.apply(bus, [].slice.call(arguments));
  return nodemon;
};

nodemon.removeAllListeners = function (event) {
  Object.keys(eventHandlers).filter(e => event ? e === event : true).forEach(event => {
    eventHandlers[event].forEach(handler => {
      bus.removeListener(event, handler);
      eventHandlers[event].splice(eventHandlers[event].indexOf(handler), 1);
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
  monitor.run.kill(true, () => {
    utils.reset();
    config.reset();
    config.run = false;
    if (done) done();
  });
});

nodemon.config = config;

module.exports = nodemon;
