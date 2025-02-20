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
const eventHandlers = {};

config.required = utils.isRequired;

function nodemon(settings) {
  bus.emit('boot');
  nodemon.reset();

  if (typeof settings === 'string') {
    settings = settings.trim();
    if (!settings.startsWith('node')) {
      settings = 'node ' + (settings.startsWith('nodemon') ? settings : 'nodemon ' + settings);
    }
    settings = cli.parse(settings);
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  if (settings.help) {
    if (process.stdout.isTTY) process.stdout._handle.setBlocking(true);
    console.log(help(settings.help));
    if (!config.required) process.exit(0);
  }

  if (settings.version) {
    version().then(v => {
      console.log(v);
      if (!config.required) process.exit(0);
    });
    return;
  }

  if (settings.cwd && process.cwd() !== path.resolve(config.system.cwd, settings.cwd)) {
    process.chdir(settings.cwd);
  }

  const cwd = process.cwd();
  config.load(settings, config => {
    if (!config.options.dump && !config.options.execOptions.script && config.options.execOptions.exec === 'node') {
      if (!config.required) {
        console.log(help('usage'));
        process.exit();
      }
      return;
    }

    utils.colours = config.options.colours;
    utils.log.info(version.pinned);

    config.loaded.map(file => file.replace(cwd, '.')).forEach(file => {
      utils.log.detail('reading config ' + file);
    });

    setupStdin(config);

    handleEvents(config);

    monitor.run(config.options);
  });

  return nodemon;
}

function setupStdin(config) {
  if (config.options.stdin) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    if (config.options.restartable) {
      process.stdin.on('data', data => {
        const str = data.trim().toLowerCase();
        if (str === config.options.restartable) {
          bus.emit('restart');
        } else if (data.charCodeAt(0) === 12) { // ctrl+l
          console.clear();
        }
      });
    } else {
      setupStdinForSignals();
    }
  }
}

function setupStdinForSignals() {
  let ctrlC = false;
  let buffer = '';
  process.stdin.on('data', data => {
    data = data.toString();
    buffer += data;
    const chr = data.charCodeAt(0);
    if (chr === 3) {
      if (ctrlC) process.exit(0);
      ctrlC = true;
      return;
    } else if (buffer === '.exit' || chr === 4) {
      process.exit();
    } else if (chr === 13 || chr === 10 || chr === 12) {
      buffer = '';
      if (chr === 12) console.clear();
    }
    ctrlC = false;
  });
  if (process.stdin.setRawMode) process.stdin.setRawMode(true);
}

function handleEvents(config) {
  if (config.options.restartable) {
    utils.log.info('to restart at any time, enter `' + config.options.restartable + '`');
  }
  if (!config.required) {
    const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
    process.on(restartSignal, nodemon.restart);
    utils.bus.on('error', () => utils.log.fail((new Error().stack)));
    utils.log.detail('send ' + restartSignal + ' to ' + process.pid + ' to restart');
  }
}

nodemon.restart = function () {
  utils.log.status('restarting child process');
  bus.emit('restart');
  return nodemon;
};

nodemon.addListener = nodemon.on = function (event, handler) {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  bus.on(event, handler);
  return nodemon;
};

nodemon.once = function (event, handler) {
  if (!eventHandlers[event]) eventHandlers[event] = [];
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
  Object.keys(eventHandlers).filter(e => !event || e === event).forEach(event => {
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
    if (done) done();
  });
});

nodemon.config = config;

module.exports = nodemon;
