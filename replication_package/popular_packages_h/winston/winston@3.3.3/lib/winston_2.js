'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');
const createLogger = require('./winston/create-logger');
const ExceptionHandler = require('./winston/exception-handler');
const RejectionHandler = require('./winston/rejection-handler');
const Container = require('./winston/container');
const Transport = require('winston-transport');
const transports = require('./winston/transports');
const config = require('./winston/config');

// Main Winston module export
const winston = module.exports = Object.create(null);

// Expose Winston version
winston.version = require('../package.json').version;

// Include and expose default transports
winston.transports = transports;

// Expose utility methods
winston.config = config;

// Hoist format-related functionality from logform
winston.addColors = logform.levels;
winston.format = logform.format;

// Logger related exports
winston.createLogger = createLogger;
winston.ExceptionHandler = ExceptionHandler;
winston.RejectionHandler = RejectionHandler;
winston.Container = Container;
winston.Transport = Transport;

// Default container of loggers
winston.loggers = new Container();

// Create and expose a default logger
const defaultLogger = createLogger();

// Expose logging methods via default logger
Object.keys(config.npm.levels).concat([
  'log', 'query', 'stream', 'add', 'remove', 
  'clear', 'profile', 'startTimer', 'handleExceptions', 
  'unhandleExceptions', 'handleRejections', 'unhandleRejections',
  'configure', 'child'
]).forEach(method => {
  winston[method] = (...args) => defaultLogger[method](...args);
});

// Getter / Setter for the default logger level
Object.defineProperty(winston, 'level', {
  get() { return defaultLogger.level; },
  set(val) { defaultLogger.level = val; }
});

// Define getter for `exceptions`
Object.defineProperty(winston, 'exceptions', {
  get() { return defaultLogger.exceptions; }
});

// Getter / Setter for properties like `exitOnError`
['exitOnError'].forEach(prop => {
  Object.defineProperty(winston, prop, {
    get() { return defaultLogger[prop]; },
    set(val) { defaultLogger[prop] = val; }
  });
});

// Expose default logger properties
Object.defineProperty(winston, 'default', {
  get() {
    return {
      exceptionHandlers: defaultLogger.exceptionHandlers,
      rejectionHandlers: defaultLogger.rejectionHandlers,
      transports: defaultLogger.transports
    };
  }
});

// Deprecation warnings and useful errors
warn.deprecated(winston, 'setLevels');
warn.forFunctions(winston, 'useFormat', ['cli']);
warn.forProperties(winston, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(winston, 'deprecated', [
  'addRewriter', 'addFilter', 'clone', 'extend'
]);
warn.forProperties(winston, 'deprecated', ['emitErrs', 'levelLength']);
warn.moved(winston, 'createLogger', 'Logger');
