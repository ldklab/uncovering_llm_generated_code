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
    settings = settings.trim();
    if (!settings.startsWith('node')) {
      settings = `node ${settings.startsWith('nodemon') ? '' : 'nodemon '}${settings}`;
    }
    settings = cli.parse(settings);
  }

  if (settings.verbose) utils.debug = true;

  if (settings.help) {
    process.stdout._handle.setBlocking(true);
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

  config.load(settings, function (config) {
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

    if (config.options.cwd) {
      utils.log.detail('process root: ' + cwd);
    }

    config.loaded.map(file => file.replace(cwd, '.')).forEach(file => {
      utils.log.detail('reading config ' + file);
    });

    if (config.options.stdin) {
      const stdinListener = () => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', data => {
          const str = data.trim().toLowerCase();
          if (str === config.options.restartable) {
            bus.emit('restart');
          } else if (data.charCodeAt(0) === 12) { // ctrl+l
            console.clear();
          }
        });
      };

      config.options.restartable ? stdinListener() : process.stdin.on('data', function (data) {
        data = data.toString();
        buffer += data;
        const chr = data.charCodeAt(0);

        if (chr === 3) {
          if (ctrlC) {
            process.exit(0);
          }
          ctrlC = true;
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

    if (config.options.restartable) {
      utils.log.info('to restart at any time, enter `' + config.options.restartable + '`');
    }

    if (!config.required) {
      const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
      process.on(restartSignal, nodemon.restart);
      utils.bus.on('error', () => {
        utils.log.fail((new Error().stack));
      });
      utils.log.detail((config.options.restartable ? 'or ' : '') + 'send ' + restartSignal + ' to ' + process.pid + ' to restart');
    }

    const ignoring = config.options.monitor.filter(rule => rule.startsWith('!'))
      .map(rule => {
        rule = rule.slice(1);
        return defaults.ignoreRoot.includes(rule) ? false : rule.startsWith(cwd) ? rule.replace(cwd, '.') : rule;
      })
      .filter(Boolean)
      .join(' ');
    if (ignoring) utils.log.detail('ignoring: ' + ignoring);

    utils.log.info('watching path(s): ' + config.options.monitor
      .filter(rule => !rule.startsWith('!'))
      .map(rule => path.relative(process.cwd(), rule))
      .filter(Boolean)
      .join(' '));

    utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));

    if (config.options.dump) {
      utils.log._log('log', '--------------');
      utils.log._log('log', 'node: ' + process.version);
      utils.log._log('log', 'nodemon: ' + version.pinned);
      utils.log._log('log', 'command: ' + process.argv.join(' '));
      utils.log._log('log', 'cwd: ' + cwd);
      utils.log._log('log', ['OS:', process.platform, process.arch].join(' '));
      utils.log._log('log', '--------------');
      utils.log._log('log', util.inspect(config, { depth: null }));
      utils.log._log('log', '--------------');
      if (!config.required) process.exit();
      return;
    }

    config.run = true;

    if (config.options.stdout === false) {
      nodemon.on('start', function () {
        nodemon.stdout = bus.stdout;
        nodemon.stderr = bus.stderr;
        bus.emit('readable');
      });
    }

    if (config.options.events && Object.keys(config.options.events).length) {
      Object.keys(config.options.events).forEach(function (key) {
        utils.log.detail('bind ' + key + ' -> `' + config.options.events[key] + '`');
        nodemon.on(key, function () {
          if (config.options && config.options.events) {
            spawn(config.options.events[key], config, [].slice.apply(arguments));
          }
        });
      });
    }

    monitor.run(config.options);
  });

  return nodemon;
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
  Object.keys(eventHandlers).filter(e => event ? e === event : true)
    .forEach(function (event) {
      eventHandlers[event].forEach(function (handler) {
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
