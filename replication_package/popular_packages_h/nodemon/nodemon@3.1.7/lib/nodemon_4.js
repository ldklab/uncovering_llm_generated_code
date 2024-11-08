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
    settings = formatSettings(settings);
    settings = cli.parse(settings);
  }

  if (settings.verbose) utils.debug = true;
  if (handleHelp(settings)) return;
  if (handleVersion(settings)) return;

  changeCwd(settings);

  config.load(settings, (config) => {
    if (!validateScript(config)) return;
    setupLogging(config);
    setupStdin(config);
    setupSignals(config);
    logPathsAndExtensions(config);
    handleConfigDump(config);
    setupEvents(config);
    monitor.run(config.options);
  });

  return nodemon;
}

function formatSettings(settings) {
  settings = settings.trim();
  if (settings.indexOf('node') !== 0) {
    if (settings.indexOf('nodemon') !== 0) {
      settings = 'nodemon ' + settings;
    }
    settings = 'node ' + settings;
  }
  return settings;
}

function handleHelp(settings) {
  if (settings.help) {
    handleBlockingOutput();
    console.log(help(settings.help));
    if (!config.required) process.exit(0);
    return true;
  }
  return false;
}

function handleVersion(settings) {
  if (settings.version) {
    version().then((v) => {
      console.log(v);
      if (!config.required) process.exit(0);
    });
    return true;
  }
  return false;
}

function changeCwd(settings) {
  if (settings.cwd) {
    const newCwd = path.resolve(config.system.cwd, settings.cwd);
    if (process.cwd() !== newCwd) process.chdir(newCwd);
  }
}

function validateScript(config) {
  if (!config.options.dump && !config.options.execOptions.script && config.options.execOptions.exec === 'node') {
    if (!config.required) {
      console.log(help('usage'));
      process.exit();
    }
    return false;
  }
  return true;
}

function setupLogging(config) {
  utils.colours = config.options.colours;
  utils.log.info(version.pinned);

  if (config.options.cwd) utils.log.detail('process root: ' + process.cwd());

  config.loaded.map(file => file.replace(process.cwd(), '.')).forEach(file => {
    utils.log.detail('reading config ' + file);
  });
}

function setupStdin(config) {
  if (!config.options.stdin) return;

  if (config.options.restartable) {
    setupRestartableStdin(config);
  } else {
    setupNonRestartableStdin();
  }
}

function setupRestartableStdin(config) {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const str = data.trim().toLowerCase();
    if (str === config.options.restartable) bus.emit('restart');
    if (data.charCodeAt(0) === 12) console.clear(); // ctrl+l
  });
}

function setupNonRestartableStdin() {
  let ctrlC = false;
  let buffer = '';

  process.stdin.on('data', (data) => {
    data = data.toString();
    buffer += data;
    const chr = data.charCodeAt(0);

    if (chr === 3) {
      if (ctrlC) process.exit(0);
      ctrlC = true;
      return;
    }

    if (buffer === '.exit' || chr === 4) process.exit();
    if (chr === 12) console.clear(); // ctrl+l
    buffer = chr === 13 || chr === 10 ? '' : buffer;
    ctrlC = false;
  });

  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

function setupSignals(config) {
  if (!config.required) {
    const restartSignal = config.options.signal === 'SIGUSR2' ? 'SIGHUP' : 'SIGUSR2';
    process.on(restartSignal, nodemon.restart);
    utils.bus.on('error', () => utils.log.fail((new Error().stack)));
    utils.log.detail(`send ${restartSignal} to ${process.pid} to restart`);
  }
}

function logPathsAndExtensions(config) {
  const ignoring = config.options.monitor.map((rule) => {
    if (rule.startsWith('!')) {
      rule = rule.slice(1);
      if (defaults.ignoreRoot.includes(rule)) return false;
      if (rule.startsWith(process.cwd())) return rule.replace(process.cwd(), '.');
      return rule;
    }
    return false;
  }).filter(Boolean).join(' ');

  if (ignoring) utils.log.detail('ignoring: ' + ignoring);

  utils.log.info('watching path(s): ' + config.options.monitor.map((rule) => {
    if (!rule.startsWith('!')) {
      try {
        rule = path.relative(process.cwd(), rule);
      } catch (e) {}
      return rule;
    }
    return false;
  }).filter(Boolean).join(' '));

  utils.log.info('watching extensions: ' + (config.options.execOptions.ext || '(all)'));
}

function handleConfigDump(config) {
  if (!config.options.dump) return;
  utils.log._log('log', '--------------');
  utils.log._log('log', `node: ${process.version}`);
  utils.log._log('log', `nodemon: ${version.pinned}`);
  utils.log._log('log', `command: ${process.argv.join(' ')}`);
  utils.log._log('log', `cwd: ${process.cwd()}`);
  utils.log._log('log', `OS: ${process.platform} ${process.arch}`);
  utils.log._log('log', '--------------');
  utils.log._log('log', util.inspect(config, { depth: null }));
  utils.log._log('log', '--------------');
  if (!config.required) process.exit();
}

function setupEvents(config) {
  config.run = true;

  if (config.options.stdout === false) {
    nodemon.on('start', function () {
      nodemon.stdout = bus.stdout;
      nodemon.stderr = bus.stderr;
      bus.emit('readable');
    });
  }

  if (config.options.events && Object.keys(config.options.events).length) {
    Object.keys(config.options.events).forEach((key) => {
      utils.log.detail(`bind ${key} -> \`${config.options.events[key]}\``);
      nodemon.on(key, function () {
        if (config.options && config.options.events) {
          spawn(config.options.events[key], config, [].slice.apply(arguments));
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
  Object.keys(eventHandlers).filter((e) => event ? e === event : true).forEach((event) => {
    eventHandlers[event].forEach((handler) => {
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
