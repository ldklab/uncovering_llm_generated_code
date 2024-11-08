'use strict';

const path = require('path');
const fs = require('fs-extra');
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
  
  if (!path.isAbsolute(loader.context)) {
    return emitError('webpack misconfiguration', 'loader.context should be absolute');
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
    ...loader.options?.[camelcase(PACKAGE_NAME)],
    ...loaderUtils.getOptions(loader)
  };

  logToTestHarness(options);

  ['attempts', 'includeRoot', 'fail'].forEach(defunctOption => {
    if (defunctOption in options) {
      emitWarning(`"${defunctOption}" is defunct`, 'use "join" if needed');
    }
  });

  if (typeof options.join !== 'function' || options.join.length !== 2) {
    return emitError('loader misconfiguration', '"join" must be a function accepting 2 arguments');
  }

  validateRootOption();

  loader.cacheable();

  let sourceMapConsumer;
  if (sourceMap) {
    try {
      const parsedMap = typeof sourceMap === 'string' ? JSON.parse(sourceMap) : sourceMap;
      const updatedMap = adjustSourceMap(loader, { format: 'absolute' }, parsedMap);
      sourceMapConsumer = new SourceMapConsumer(updatedMap);
    } catch (error) {
      return emitError('source-map error', error.message);
    }
  }

  const enginePath = getEnginePath();
  if (!enginePath) {
    return emitError('loader misconfiguration', '"engine" option is not valid');
  }

  const callback = loader.async();
  processContent(enginePath).then(onSuccess).catch(onFailure);

  function validateRootOption() {
    if (typeof options.root === 'string') {
      const rootValid = !options.root || (path.isAbsolute(options.root) && fs.existsSync(options.root) && fs.statSync(options.root).isDirectory());
      if (!rootValid) {
        emitError('loader misconfiguration', '"root" must be an empty string or a valid directory path');
      }
    } else if (options.root !== false) {
      emitWarning('"root" option', 'must be a string or false when unused');
    }
  }

  function getEnginePath() {
    const engineFile = /^[a-zA-Z0-9]+$/.test(options.engine) && path.join(__dirname, 'lib', 'engine', `${options.engine}.js`);
    return engineFile && fs.existsSync(engineFile) ? engineFile : null;
  }

  async function processContent(enginePath) {
    return require(enginePath)(loader.resourcePath, content, {
      outputSourceMap: options.sourceMap,
      transformDeclaration: valueProcessor(loader.resourcePath, options),
      absSourceMap: sourceMapConsumer ? sourceMapConsumer.sourceMap : null,
      sourceMapConsumer,
      removeCR: options.removeCR
    });
  }

  function onFailure(error) {
    callback(emitError('CSS error', error));
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

  function emitWarning(label, message) {
    if (!options.silent) loader.emitWarning(new Error(`${PACKAGE_NAME}: ${label} - ${message}`));
    return content;
  }

  function emitError(label, message) {
    loader.emitError(new Error(`${PACKAGE_NAME}: ${label} - ${message}`));
    return content;
  }
}

module.exports = Object.assign(resolveUrlLoader, joinFn);
