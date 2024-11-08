'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');

// Export version from package.json
exports.version = require('../package.json').version;

// Export default transports and configurations
exports.transports = require('./winston/transports');
exports.config = require('./winston/config');

// Hoist format-related functionalities from logform
exports.addColors = logform.levels;
exports.format = logform.format;

// Core Logging-related exports
exports.createLogger = require('./winston/create-logger');
exports.Logger = require('./winston/logger');
exports.ExceptionHandler = require('./winston/exception-handler');
exports.RejectionHandler = require('./winston/rejection-handler');
exports.Container = require('./winston/container');
exports.Transport = require('winston-transport');

// Create and expose a default `Container`
exports.loggers = new exports.Container();

// Create and expose a 'defaultLogger'
const defaultLogger = exports.createLogger();

// Method passthrough from defaultLogger to `winston`
Object.keys(exports.config.npm.levels).concat([
  'log', 'query', 'stream', 'add', 'remove', 'clear', 'profile',
  'startTimer', 'handleExceptions', 'unhandleExceptions', 'handleRejections',
  'unhandleRejections', 'configure', 'child'
]).forEach(method => {
  exports[method] = (...args) => defaultLogger[method](...args);
});

// Define getter/setter for the default logger level
Object.defineProperty(exports, 'level', {
  get: () => defaultLogger.level,
  set: (val) => { defaultLogger.level = val; }
});

// Define getter for `exceptions`
Object.defineProperty(exports, 'exceptions', {
  get: () => defaultLogger.exceptions
});

// Define getter for `rejections`
Object.defineProperty(exports, 'rejections', {
  get: () => defaultLogger.rejections
});

// Define getters/setters for specific default logger properties
['exitOnError'].forEach(prop => {
  Object.defineProperty(exports, prop, {
    get: () => defaultLogger[prop],
    set: (val) => { defaultLogger[prop] = val; }
  });
});

// Access to default exceptionHandlers, rejectionHandlers, and transports
Object.defineProperty(exports, 'default', {
  get: () => ({
    exceptionHandlers: defaultLogger.exceptionHandlers,
    rejectionHandlers: defaultLogger.rejectionHandlers,
    transports: defaultLogger.transports
  })
});

// Deprecation warnings for properties/methods
warn.deprecated(exports, 'setLevels');
warn.forFunctions(exports, 'useFormat', ['cli']);
warn.forProperties(exports, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(exports, 'deprecated', ['addRewriter', 'addFilter', 'clone', 'extend']);
warn.forProperties(exports, 'deprecated', ['emitErrs', 'levelLength']);
