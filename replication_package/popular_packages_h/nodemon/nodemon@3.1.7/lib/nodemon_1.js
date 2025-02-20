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
    settings = parseSettings(settings);
  }

  if (settings.verbose) {
    utils.debug = true;
  }

  handleHelpAndVersion(settings);
  adjustWorkingDirectory(settings);

  const cwd = process.cwd();

  config.load(settings, (config) => {
    if (shouldExit(config)) return;
    
    setupLogging(config);
    
    if (config.options.stdin && config.options.restartable) {
      enableInteractiveRestart(config);
    } else if (config.options.stdin) {
      setupStdinHandling();
    }

    logIgnoredPaths(config, cwd);
    logWatchedPaths(config, cwd);
    logExtensions(config);

    if (config.options.dump) {
      dumpConfigInfo(config, cwd);
      return;
    }

    config.run = true;
    if (config.options.stdout === false) {
      handleStdoutRedirection();
    }

    bindEventHandlers(config);
    monitor.run(config.options);
  });

  return nodemon;
}

const parseSettings = (settings) => {
  settings = settings.trim();
  if (!settings.startsWith('node')) {
    if (!settings.startsWith('nodemon')) {
      settings = 'nodemon ' + settings;
    }
    settings = 'node ' + settings;
  }
  return cli.parse(settings);
}

const handleHelpAndVersion = (settings) => {
  if (settings.help) {
    if (process.stdout.isTTY) {
      process.stdout._handle.setBlocking(true);
    }
    console.log(help(settings.help));
    if (!config.required) {
      process.exit(0);
    }
  }

  if (settings.version) {
    version().then((v) => {
      console.log(v);
      if (!config.required) {
        process.exit(0);
      }
    });
    return;
  }
}

const adjustWorkingDirectory = (settings) => {
  if (settings.cwd) {
    const targetCwd = path.resolve(config.system.cwd, settings.cwd);
    if (process.cwd() !== targetCwd) {
      process.chdir(settings.cwd);
    }
  }
}

const shouldExit = (config) => {
  if (!config.options.dump && !config.options.execOptions.script &&
      config.options.execOptions.exec === 'node' && !config.required) {
    console.log(help('usage'));
    process.exit();
    return true;
  }
  return false;
}

const setupLogging = (config) => {
  utils.colours = config.options.colours;
  utils.log.info(version.pinned);
  if (config.options.cwd) {
    utils.log.detail('process root: ' + process.cwd());
  }
  config.loaded.map(file => file.replace(process.cwd(), '.'))
    .forEach(file => utils.log.detail('reading config ' + file));
}

const enableInteractiveRestart = (config) => {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => handleStdinData(data, config.options.restartable));
}

const handleStdinData = (data, restartable) => {
  const command = data.toString().trim().toLowerCase();
  if (command === restartable) {
    bus.emit('restart');
  } else if (data.charCodeAt(0) === 12) {
    console.clear();
  }
}

const setupStdinHandling = () => {
  let ctrlC = false;
  let buffer = '';

  process.stdin.on('data', (data) => handleNonRestartableStdin(data, buffer, ctrlC));
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

const handleNonRestartableStdin = (data, buffer, ctrlC) => {
  buffer += data = data.toString();
  const chr = data.charCodeAt(0);

  if (chr === 3) {
    if (ctrlC) process.exit(0);
    ctrlC = true;
    return;
  }

  switch (buffer) {
    case '.exit':
    case '\u0004':
      process.exit();
      break;
    default:
      if ([13, 10].includes(chr)) buffer = '';
      if (chr === 12) console.clear();
      ctrlC = false;
  }
}

const logIgnoredPaths = (config, cwd) => {
  const ignoring = config.options.monitor
    .map(rule => (rule.slice(0, 1) === '!' && defaults.ignoreRoot.includes(rule.slice(1))) ? false : rule.slice(1))
    .filter(rule => rule && (rule.startsWith(cwd) ? rule.replace(cwd, '.') : rule))
    .join(' ');
  if (ignoring) utils.log.detail('ignoring: ' + ignoring);
}

const logWatchedPaths = (config, cwd) => {
  const watchingPaths = config.options.monitor
    .map(rule => rule.slice(0, 1) !== '!' ? path.relative(process.cwd(), rule) : false)
    .filter(Boolean)
    .join(' ');
  utils.log.info('watching path(s): ' + watchingPaths);
}

const logExtensions = (config) => {
  const extensions = config.options.execOptions.ext || '(all)';
  utils.log.info('watching extensions: ' + extensions);
}

const dumpConfigInfo = (config, cwd) => {
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
}

const handleStdoutRedirection = () => {
  nodemon.on('start', () => {
    nodemon.stdout = bus.stdout;
    nodemon.stderr = bus.stderr;
    bus.emit('readable');
  });
}

const bindEventHandlers = (config) => {
  if (config.options.events && Object.keys(config.options.events).length) {
    Object.entries(config.options.events).forEach(([key, command]) => {
      utils.log.detail('bind ' + key + ' -> `' + command + '`');
      nodemon.on(key, () => execCommand(command, config, [].slice.call(arguments)));
    });
  }
}

const execCommand = (command, config, args) => spawn(command, config, args);

nodemon.restart = () => {
  utils.log.status('restarting child process');
  bus.emit('restart');
  return nodemon;
};

nodemon.on = nodemon.addListener = (event, handler) => {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  bus.on(event, handler);
  return nodemon;
};

nodemon.once = (event, handler) => {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  bus.once(event, () => {
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

nodemon.removeAllListeners = (event) => {
  Object.keys(eventHandlers).filter(e => event ? e === event : true).forEach(event => {
    eventHandlers[event].forEach(handler => {
      bus.removeListener(event, handler);
      eventHandlers[event].splice(eventHandlers[event].indexOf(handler), 1);
    });
  });
  return nodemon;
};

nodemon.reset = (done) => {
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
