'use strict';

const logform = require('logform');
const { warn } = require('./winston/common');
const { version } = require('../package.json');
const transports = require('./winston/transports');
const config = require('./winston/config');
const createLogger = require('./winston/create-logger');
const ExceptionHandler = require('./winston/exception-handler');
const RejectionHandler = require('./winston/rejection-handler');
const Container = require('./winston/container');
const Transport = require('winston-transport');

const winston = {
  version,
  transports,
  config,
  addColors: logform.levels,
  format: logform.format,
  createLogger,
  ExceptionHandler,
  RejectionHandler,
  Container,
  Transport,
  loggers: new Container(),
};

const defaultLogger = winston.createLogger();

Object.keys(winston.config.npm.levels).concat([
  'log', 'query', 'stream', 'add', 'remove', 'clear', 'profile', 
  'startTimer', 'handleExceptions', 'unhandleExceptions', 
  'handleRejections', 'unhandleRejections', 'configure', 'child'
]).forEach(
  method => winston[method] = (...args) => defaultLogger[method](...args)
);

Object.defineProperty(winston, 'level', {
  get: () => defaultLogger.level,
  set: (val) => { defaultLogger.level = val; },
});

Object.defineProperty(winston, 'exceptions', {
  get: () => defaultLogger.exceptions,
});

['exitOnError'].forEach(prop => {
  Object.defineProperty(winston, prop, {
    get: () => defaultLogger[prop],
    set: (val) => { defaultLogger[prop] = val; }
  });
});

Object.defineProperty(winston, 'default', {
  get: () => ({
    exceptionHandlers: defaultLogger.exceptionHandlers,
    rejectionHandlers: defaultLogger.rejectionHandlers,
    transports: defaultLogger.transports
  })
});

warn.deprecated(winston, 'setLevels');
warn.forFunctions(winston, 'useFormat', ['cli']);
warn.forProperties(winston, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(winston, 'deprecated', ['addRewriter', 'addFilter', 'clone', 'extend']);
warn.forProperties(winston, 'deprecated', ['emitErrs', 'levelLength']);
warn.moved(winston, 'createLogger', 'Logger');

module.exports = winston;
