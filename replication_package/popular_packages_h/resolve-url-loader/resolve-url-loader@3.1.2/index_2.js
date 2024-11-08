'use strict';

const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');
const camelcase = require('camelcase');
const { SourceMapConsumer } = require('source-map');
const adjustSourceMap = require('adjust-sourcemap-loader/lib/process');
const valueProcessor = require('./lib/value-processor');
const joinFn = require('./lib/join-function');
const logToTestHarness = require('./lib/log-to-test-harness');
const PACKAGE_NAME = require('./package.json').name;

function resolveUrlLoader(content, sourceMap) {
  const loader = this;

  if (/^\./.test(loader.context)) {
    return emitError('webpack misconfiguration', 'loader.context is relative, expected absolute');
  }

  const options = {
    sourceMap: loader.sourceMap,
    engine: 'postcss',
    silent: false,
    absolute: false,
    keepQuery: false,
    removeCR: false,
    root: false,
    debug: false,
    join: joinFn.defaultJoin,
    ...loader.options && loader.options[camelcase(PACKAGE_NAME)],
    ...loaderUtils.getOptions(loader)
  };

  logToTestHarness(options);

  checkDeprecatedOptions(options);

  if (typeof options.join !== 'function') {
    return emitError('loader misconfiguration', '"join" option must be a Function with 2 arguments');
  }

  if (!isValidRoot(options.root)) {
    return emitError('loader misconfiguration', '"root" option must be valid');
  }

  loader.cacheable();

  let adjustedSourceMap, smConsumer;
  if (sourceMap) {
    sourceMap = parseSourceMap(sourceMap) || sourceMap;
    adjustedSourceMap = adjustMap(loader, sourceMap);
    smConsumer = new SourceMapConsumer(adjustedSourceMap);
  }

  const enginePath = getEnginePath(options.engine);
  if (!enginePath) {
    return emitError('loader misconfiguration', '"engine" option is not valid');
  }

  const callback = loader.async();
  processContent(enginePath, loader, content, options)
    .then(reworked => handleSuccess(callback, options, loader, reworked))
    .catch(error => callback(handleError('CSS error', error)));

  function emitError(label, exception) {
    loader.emitError(handleError(label, exception));
    return content;
  }

  function emitWarning(label, exception) {
    if (!options.silent) {
      loader.emitWarning(handleError(label, exception));
    }
    return content;
  }

  function handleError(label, exception) {
    return new Error(`${PACKAGE_NAME}: ${label}\n  ${getExceptionMessage(exception)}`);
  }

  function handleSuccess(callback, options, loader, reworked) {
    if (reworked) {
      if (options.sourceMap) {
        const finalMap = adjustMap(loader, reworked.map, 'sourceRelative');
        callback(null, reworked.content, finalMap);
      } else {
        callback(null, reworked.content);
      }
    }
  }

  function parseSourceMap(sourceMap) {
    try {
      return typeof sourceMap === 'string' ? JSON.parse(sourceMap) : null;
    } catch {
      return emitError('source-map error', 'cannot parse source-map string');
    }
  }

  function adjustMap(loader, sourceMap, format = 'absolute') {
    try {
      return adjustSourceMap(loader, { format }, sourceMap);
    } catch (exception) {
      return emitError('source-map error', exception.message);
    }
  }

  function getEnginePath(engine) {
    const enginePath = /^\w+$/.test(engine) && path.join(__dirname, 'lib', 'engine', `${engine}.js`);
    return fs.existsSync(enginePath) ? enginePath : null;
  }

  async function processContent(enginePath, loader, content, options) {
    return require(enginePath)(loader.resourcePath, content, {
      outputSourceMap: !!options.sourceMap,
      transformDeclaration: valueProcessor(loader.resourcePath, options),
      absSourceMap: adjustedSourceMap,
      sourceMapConsumer: smConsumer,
      removeCR: options.removeCR
    });
  }

  function checkDeprecatedOptions(options) {
    ['attempts', 'includeRoot', 'fail'].forEach(defunct => {
      if (defunct in options) {
        emitWarning('loader misconfiguration', `"${defunct}" option is defunct`);
      }
    });
  }

  function isValidRoot(root) {
    if (typeof root === 'string') {
      return root === '' || (path.isAbsolute(root) && fs.existsSync(root) && fs.statSync(root).isDirectory());
    } else if (root !== false) {
      emitWarning('loader misconfiguration', '"root" option must be string where used or false where unused');
    }
    return true;
  }

  function getExceptionMessage(exception) {
    if (typeof exception === 'string') return exception;
    if (exception instanceof Error) return `${exception.message}\n  ${exception.stack.split('\n')[1].trim()}`;
    return '';
  }
}

module.exports = Object.assign(resolveUrlLoader, joinFn);
