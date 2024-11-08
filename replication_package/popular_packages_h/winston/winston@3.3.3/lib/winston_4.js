'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');
const winston = exports;

// Expose the version from package.json
winston.version = require('../package.json').version;

// Include default transports and config
winston.transports = require('./winston/transports');
winston.config = require('./winston/config');

// Expose format-related functionalities from logform
winston.addColors = logform.levels;
winston.format = logform.format;

// Expose core logging functionalities
winston.createLogger = require('./winston/create-logger');
winston.ExceptionHandler = require('./winston/exception-handler');
winston.RejectionHandler = require('./winston/rejection-handler');
winston.Container = require('./winston/container');
winston.Transport = require('winston-transport');

// Manage multiple logger instances using a default container
winston.loggers = new winston.Container();

// Create a default logger to simplify logging operations
const defaultLogger = winston.createLogger();

// Proxy methods to the default logger
const methods = [
  ...Object.keys(winston.config.npm.levels),
  'log', 'query', 'stream', 'add', 'remove', 'clear', 
  'profile', 'startTimer', 'handleExceptions', 
  'unhandleExceptions', 'handleRejections', 
  'unhandleRejections', 'configure', 'child'
];

methods.forEach(method => {
  winston[method] = (...args) => defaultLogger[method](...args);
});

// Define property accessors for the default logger's characteristics
Object.defineProperty(winston, 'level', {
  get() { return defaultLogger.level; },
  set(val) { defaultLogger.level = val; }
});

Object.defineProperty(winston, 'exceptions', {
  get() { return defaultLogger.exceptions; }
});

['exitOnError'].forEach(prop => {
  Object.defineProperty(winston, prop, {
    get() { return defaultLogger[prop]; },
    set(val) { defaultLogger[prop] = val; }
  });
});

// Provide default logging configurations
Object.defineProperty(winston, 'default', {
  get() {
    return {
      exceptionHandlers: defaultLogger.exceptionHandlers,
      rejectionHandlers: defaultLogger.rejectionHandlers,
      transports: defaultLogger.transports
    };
  }
});

// Notify users about deprecated properties and functions
warn.deprecated(winston, 'setLevels');
warn.forFunctions(winston, 'useFormat', ['cli']);
warn.forProperties(winston, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(winston, 'deprecated', ['addRewriter', 'addFilter', 'clone', 'extend']);
warn.forProperties(winston, 'deprecated', ['emitErrs', 'levelLength']);
warn.moved(winston, 'createLogger', 'Logger');
