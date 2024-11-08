'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');

exports.version = require('../package.json').version;
exports.transports = require('./winston/transports');
exports.config = require('./winston/config');
exports.addColors = logform.levels;
exports.format = logform.format;
exports.createLogger = require('./winston/create-logger');
exports.Logger = require('./winston/logger');
exports.ExceptionHandler = require('./winston/exception-handler');
exports.RejectionHandler = require('./winston/rejection-handler');
exports.Container = require('./winston/container');
exports.Transport = require('winston-transport');
exports.loggers = new exports.Container();

const defaultLogger = exports.createLogger();

Object.keys(exports.config.npm.levels)
  .concat([
    'log',
    'query',
    'stream',
    'add',
    'remove',
    'clear',
    'profile',
    'startTimer',
    'handleExceptions',
    'unhandleExceptions',
    'handleRejections',
    'unhandleRejections',
    'configure',
    'child'
  ])
  .forEach(
    method => (exports[method] = (...args) => defaultLogger[method](...args))
  );

Object.defineProperty(exports, 'level', {
  get() {
    return defaultLogger.level;
  },
  set(val) {
    defaultLogger.level = val;
  }
});

Object.defineProperty(exports, 'exceptions', {
  get() {
    return defaultLogger.exceptions;
  }
});

Object.defineProperty(exports, 'rejections', {
  get() {
    return defaultLogger.rejections;
  }
});

['exitOnError'].forEach(prop => {
  Object.defineProperty(exports, prop, {
    get() {
      return defaultLogger[prop];
    },
    set(val) {
      defaultLogger[prop] = val;
    }
  });
});

Object.defineProperty(exports, 'default', {
  get() {
    return {
      exceptionHandlers: defaultLogger.exceptionHandlers,
      rejectionHandlers: defaultLogger.rejectionHandlers,
      transports: defaultLogger.transports
    };
  }
});

warn.deprecated(exports, 'setLevels');
warn.forFunctions(exports, 'useFormat', ['cli']);
warn.forProperties(exports, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(exports, 'deprecated', [
  'addRewriter',
  'addFilter',
  'clone',
  'extend'
]);
warn.forProperties(exports, 'deprecated', ['emitErrs', 'levelLength']);
