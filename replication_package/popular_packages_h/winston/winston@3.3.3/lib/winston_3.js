'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');

const winston = exports;

winston.version = require('../package.json').version;
winston.transports = require('./winston/transports');
winston.config = require('./winston/config');
winston.addColors = logform.levels;
winston.format = logform.format;
winston.createLogger = require('./winston/create-logger');
winston.ExceptionHandler = require('./winston/exception-handler');
winston.RejectionHandler = require('./winston/rejection-handler');
winston.Container = require('./winston/container');
winston.Transport = require('winston-transport');
winston.loggers = new winston.Container();

const defaultLogger = winston.createLogger();

Object.keys(winston.config.npm.levels)
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
    method => (winston[method] = (...args) => defaultLogger[method](...args))
  );

Object.defineProperty(winston, 'level', {
  get() {
    return defaultLogger.level;
  },
  set(val) {
    defaultLogger.level = val;
  }
});

Object.defineProperty(winston, 'exceptions', {
  get() {
    return defaultLogger.exceptions;
  }
});

['exitOnError'].forEach(prop => {
  Object.defineProperty(winston, prop, {
    get() {
      return defaultLogger[prop];
    },
    set(val) {
      defaultLogger[prop] = val;
    }
  });
});

Object.defineProperty(winston, 'default', {
  get() {
    return {
      exceptionHandlers: defaultLogger.exceptionHandlers,
      rejectionHandlers: defaultLogger.rejectionHandlers,
      transports: defaultLogger.transports
    };
  }
});

warn.deprecated(winston, 'setLevels');
warn.forFunctions(winston, 'useFormat', ['cli']);
warn.forProperties(winston, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(winston, 'deprecated', [
  'addRewriter',
  'addFilter',
  'clone',
  'extend'
]);
warn.forProperties(winston, 'deprecated', ['emitErrs', 'levelLength']);
warn.moved(winston, 'createLogger', 'Logger');
