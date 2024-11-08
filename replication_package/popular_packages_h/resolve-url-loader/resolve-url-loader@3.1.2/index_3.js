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
    return handleAsError('webpack misconfiguration', 'loader.context is relative, expected absolute');
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

  ['attempts', 'includeRoot', 'fail'].forEach(option => {
    if (option in options) {
      handleAsWarning('loader misconfiguration', `"${option}" option is defunct (consider "join" option if search is needed)`);
    }
  });

  if (typeof options.join !== 'function' || options.join.length !== 2) {
    return handleAsError('loader misconfiguration', '"join" option must be a Function and take exactly 2 arguments');
  }

  if (typeof options.root === 'string') {
    if (!(options.root === '' || (path.isAbsolute(options.root) && fs.existsSync(options.root) && fs.statSync(options.root).isDirectory()))) {
      return handleAsError('loader misconfiguration', '"root" option must be an empty string or an absolute path to an existing directory');
    }
  } else if (options.root !== false) {
    handleAsWarning('loader misconfiguration', '"root" option must be string where used or false where unused');
  }

  loader.cacheable();

  let sourceMapConsumer, absSourceMap;
  if (sourceMap) {
    try {
      sourceMap = typeof sourceMap === 'string' ? JSON.parse(sourceMap) : sourceMap;
      absSourceMap = adjustSourceMap(loader, { format: 'absolute' }, sourceMap);
      sourceMapConsumer = new SourceMapConsumer(absSourceMap);
    } catch (exception) {
      return handleAsError('source-map error', 'cannot parse source-map string (from less-loader?)');
    }
  }

  const enginePath = /^\w+$/.test(options.engine) && path.join(__dirname, 'lib', 'engine', `${options.engine}.js`);
  if (!fs.existsSync(enginePath)) {
    return handleAsError('loader misconfiguration', '"engine" option is not valid');
  }

  const callback = loader.async();
  Promise
    .resolve(require(enginePath)(loader.resourcePath, content, {
      outputSourceMap: !!options.sourceMap,
      transformDeclaration: valueProcessor(loader.resourcePath, options),
      absSourceMap,
      sourceMapConsumer,
      removeCR: options.removeCR
    }))
    .catch(onFailure)
    .then(onSuccess);

  function onFailure(error) {
    callback(encodeError('CSS error', error));
  }

  function onSuccess(reworked) {
    if (reworked) {
      if (options.sourceMap) {
        const finalMap = adjustSourceMap(loader, { format: 'sourceRelative' }, reworked.map);
        callback(null, reworked.content, finalMap);
      } else {
        callback(null, reworked.content);
      }
    }
  }

  function handleAsWarning(label, exception) {
    if (!options.silent) {
      loader.emitWarning(encodeError(label, exception));
    }
    return content;
  }

  function handleAsError(label, exception) {
    loader.emitError(encodeError(label, exception));
    return content;
  }

  function encodeError(label, exception) {
    return new Error([
      `${PACKAGE_NAME}: ${label}`,
      exception instanceof Error ? `${exception.message}\n  ${exception.stack.split('\n')[1].trim()}`:
      typeof exception === 'string' ? `${exception}` : ''
    ].filter(Boolean).join('\n  '));
  }
}

module.exports = { ...resolveUrlLoader, ...joinFn };
