'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');

const packageJson = require('../package.json');
const transports = require('./winston/transports');
const config = require('./winston/config');
const createLogger = require('./winston/create-logger');
const Logger = require('./winston/logger');
const ExceptionHandler = require('./winston/exception-handler');
const RejectionHandler = require('./winston/rejection-handler');
const Container = require('./winston/container');
const Transport = require('winston-transport');

exports.version = packageJson.version;
exports.transports = transports;
exports.config = config;
exports.addColors = logform.levels;
exports.format = logform.format;
exports.createLogger = createLogger;
exports.Logger = Logger;
exports.ExceptionHandler = ExceptionHandler;
exports.RejectionHandler = RejectionHandler;
exports.Container = Container;
exports.Transport = Transport;
exports.loggers = new Container();

const defaultLogger = createLogger();
const methodsToDelegate = Object.keys(config.npm.levels).concat([
  'log', 'query', 'stream', 'add', 'remove', 'clear', 
  'profile', 'startTimer', 'handleExceptions', 
  'unhandleExceptions', 'handleRejections', 'unhandleRejections', 
  'configure', 'child'
]);

methodsToDelegate.forEach(method => {
  exports[method] = (...args) => defaultLogger[method](...args);
});

Object.defineProperty(exports, 'level', {
  get: () => defaultLogger.level,
  set: (val) => defaultLogger.level = val
});

Object.defineProperty(exports, 'exceptions', {
  get: () => defaultLogger.exceptions
});

Object.defineProperty(exports, 'rejections', {
  get: () => defaultLogger.rejections
});

['exitOnError'].forEach(prop => {
  Object.defineProperty(exports, prop, {
    get: () => defaultLogger[prop],
    set: (val) => defaultLogger[prop] = val
  });
});

Object.defineProperty(exports, 'default', {
  get: () => ({
    exceptionHandlers: defaultLogger.exceptionHandlers,
    rejectionHandlers: defaultLogger.rejectionHandlers,
    transports: defaultLogger.transports
  })
});

warn.deprecated(exports, 'setLevels');
warn.forFunctions(exports, 'useFormat', ['cli']);
warn.forProperties(exports, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(exports, 'deprecated', [
  'addRewriter', 'addFilter', 'clone', 'extend'
]);
warn.forProperties(exports, 'deprecated', ['emitErrs', 'levelLength']);
