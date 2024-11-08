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

let eventHandlers = [];

config.required = utils.isRequired;

function nodemon(settings) {
  bus.emit('boot');
  nodemon.reset();

  if (typeof settings === 'string') {
    settings = setupSettings(settings);
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  handleHelpAndVersion(settings);

  if (settings.cwd) {
    changeWorkingDirectory(settings);
  }

  loadConfiguration(settings, manageProcess);
}

function setupSettings(settings) {
  settings = settings.trim();
  if (!settings.startsWith('node') && !settings.startsWith('nodemon')) {
    settings = `node nodemon ${settings}`;
  }
  return cli.parse(settings);
}

function handleHelpAndVersion(settings) {
  if (settings.help) {
    showHelpAndExit(settings.help);
  }

  if (settings.version) {
    version().then(v => {
      console.log(v);
      if (!config.required) {
        process.exit(0);
      }
    });
    return;
  }
}

function showHelpAndExit(helpText) {
  process.stdout._handle.setBlocking(true);
  console.log(help(helpText));
  if (!config.required) {
    process.exit(0);
  }
}

function changeWorkingDirectory(settings) {
  const currentDir = path.resolve(config.system.cwd, settings.cwd);
  if (process.cwd() !== currentDir) {
    process.chdir(settings.cwd);
  }
}

function loadConfiguration(settings, callback) {
  config.load(settings, callback);
}

function manageProcess(config) {
  if (!config.options.dump && !config.options.execOptions.script && config.options.execOptions.exec === 'node') {
    if (!config.required) {
      console.log(help('usage'));
      process.exit();
    }
    return;
  }

  utils.colours = config.options.colours;
  utils.log.info(version.pinned);
  logCurrentConfigDetails(config);

  if (config.options.stdin) {
    setupStdin(config);
  }

  if (config.options.restartable) {
    utils.log.info(`to restart at any time, enter \`${config.options.restartable}\``);
  }

  if (!config.required) {
    bindRestartSignal(config);
  }

  logMonitoringDetails(config);

  if (config.options.dump) {
    dumpCurrentSettings(config);
    return;
  }

  config.run = true;

  if (config.options.stdout === false) {
    setupStdoutListeners();
  }

  bindEventHandlers(config);

  monitor.run(config.options);
}

function setupStdin(config) {
  if (config.options.restartable) {
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
  } else {
    configureStdinWithoutRestartable(config);
  }
}

function configureStdinWithoutRestartable(config) {
  let ctrlC = false;
  let buffer = '';

  process.stdin.on('data', data => {
    data = data.toString();
    buffer += data;
    handleSpecialKeyPress(ctrlC, buffer, data);

    if (data.charCodeAt(0) === 3) {
      ctrlC = !ctrlC;
      if (ctrlC) process.exit(0);
    } else if (buffer === '.exit' || data.charCodeAt(0) === 4) {
      process.exit(0);
    } else if ([13, 10].includes(data.charCodeAt(0))) {
      buffer = '';
    } else if (data.charCodeAt(0) === 12) {
      console.clear();
      buffer = '';
    }
    ctrlC = false;
  });
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

function handleSpecialKeyPress(ctrlC, buffer, data) {
  // handle Ctrl+C, .exit, and other special sequences
  if (data.charCodeAt(0) === 3) {
    if (ctrlC) process.exit(0);
    return;
  } else if (buffer === '.exit' || data.charCodeAt(0) === 4) {
    process.exit();
  }
}

function bindRestartSignal(config) {
  const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
  process.on(restartSignal, nodemon.restart);
  utils.bus.on('error', () => utils.log.fail((new Error().stack)));
  utils.log.detail(`${config.options.restartable ? 'or ' : ''}send ${restartSignal} to ${process.pid} to restart`);
}

function logMonitoringDetails(config) {
  const cwd = process.cwd();
  const ignoring = getIgnoringPaths(config, cwd);
  if (ignoring) utils.log.detail('ignoring: ' + ignoring);

  utils.log.info('watching path(s): ' + getWatchingPaths(config, cwd));
  utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));
}

function getIgnoringPaths(config, cwd) {
  return config.options.monitor.map(rule => {
    if (rule.startsWith('!')) {
      rule = rule.slice(1);
      if (!defaults.ignoreRoot.includes(rule)) {
        return rule.startsWith(cwd) ? rule.replace(cwd, '.') : rule;
      }
    }
    return false;
  }).filter(Boolean).join(' ');
}

function getWatchingPaths(config, cwd) {
  return config.options.monitor.filter(rule => !rule.startsWith('!')).map(rule => {
    try {
      return path.relative(process.cwd(), rule);
    } catch (e) {
      return false;
    }
  }).filter(Boolean).join(' ');
}

function dumpCurrentSettings(config) {
  utils.log._log('log', '--------------');
  utils.log._log('log', `node: ${process.version}`);
  utils.log._log('log', `nodemon: ${version.pinned}`);
  utils.log._log('log', 'command: ' + process.argv.join(' '));
  utils.log._log('log', 'cwd: ' + process.cwd());
  utils.log._log('log', ['OS:', process.platform, process.arch].join(' '));
  utils.log._log('log', '--------------');
  utils.log._log('log', util.inspect(config, { depth: null }));
  utils.log._log('log', '--------------');
  if (!config.required) {
    process.exit();
  }
}

function setupStdoutListeners() {
  nodemon.on('start', () => {
    nodemon.stdout = bus.stdout;
    nodemon.stderr = bus.stderr;
    bus.emit('readable');
  });
}

function bindEventHandlers(config) {
  if (config.options.events && Object.keys(config.options.events).length) {
    Object.entries(config.options.events).forEach(([key, command]) => {
      utils.log.detail(`bind ${key} -> \`${command}\``);
      nodemon.on(key, function () {
        if (config.options && config.options.events) {
          spawn(command, config, [].slice.call(arguments));
        }
      });
    });
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
  monitor.run.kill(true, function () {
    utils.reset();
    config.reset();
    config.run = false;
    if (done) {
      done();
    }
  });
});

nodemon.config = config;

module.exports = nodemon;
