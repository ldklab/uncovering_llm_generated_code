'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const util = require('util');
const loaderUtils = require('loader-utils');
const { SourceMapConsumer } = require('source-map');
const adjustSourceMap = require('adjust-sourcemap-loader/lib/process');
const valueProcessor = require('./lib/value-processor');
const joinFn = require('./lib/join-function');
const logToTestHarness = require('./lib/log-to-test-harness');

const DEPRECATED_OPTIONS = {
  engine: [
    'DEP_RESOLVE_URL_LOADER_OPTION_ENGINE',
    '"engine" option has been removed, postcss is the only parser used'
  ],
  keepQuery: [
    'DEP_RESOLVE_URL_LOADER_OPTION_KEEP_QUERY',
    '"keepQuery" option has been removed, the query and/or hash are now always retained'
  ],
  absolute: [
    'DEP_RESOLVE_URL_LOADER_OPTION_ABSOLUTE',
    '"absolute" option has been removed, consider the "join" option if absolute paths must be processed'
  ],
  attempts: [
    'DEP_RESOLVE_URL_LOADER_OPTION_ATTEMPTS',
    '"attempts" option has been removed, consider the "join" option if search is needed'
  ],
  includeRoot: [
    'DEP_RESOLVE_URL_LOADER_OPTION_INCLUDE_ROOT',
    '"includeRoot" option has been removed, consider the "join" option if search is needed'
  ],
  fail: [
    'DEP_RESOLVE_URL_LOADER_OPTION_FAIL',
    '"fail" option has been removed'
  ]
};

function resolveUrlLoader(content, sourceMap) {
  const loader = this;
  if (/^\./.test(loader.context)) {
    return handleAsError('webpack misconfiguration', 'loader.context is relative, expected absolute');
  }

  const isWebpackGte5 = 'getOptions' in loader && typeof loader.getOptions === 'function';
  const rawOptions = isWebpackGte5 ? loader.getOptions() : loaderUtils.getOptions(loader);
  const options = Object.assign({
    sourceMap: loader.sourceMap,
    silent: false,
    removeCR: os.EOL.includes('\r'),
    root: false,
    debug: false,
    join: joinFn.defaultJoin
  }, rawOptions);

  if (process.env.RESOLVE_URL_LOADER_TEST_HARNESS) {
    logToTestHarness(process[process.env.RESOLVE_URL_LOADER_TEST_HARNESS], options);
  }

  Object.entries(DEPRECATED_OPTIONS).filter(([key]) => key in rawOptions).forEach(([, value]) => handleAsDeprecated(...value));

  if (typeof options.join !== 'function' || options.join.length !== 2) {
    return handleAsError('loader misconfiguration', '"join" Function must take exactly 2 arguments (options, loader)');
  }

  const joinProper = options.join(options, loader);
  if (typeof joinProper !== 'function' || joinProper.length !== 1) {
    return handleAsError('loader misconfiguration', '"join" Function must create a function that takes exactly 1 arguments (item)');
  }

  if (typeof options.root === 'string') {
    const isValid = (options.root === '') || (path.isAbsolute(options.root) && fs.existsSync(options.root) && fs.statSync(options.root).isDirectory());

    if (!isValid) {
      return handleAsError('loader misconfiguration', '"root" option must be an empty string or an absolute path to an existing directory');
    }
  } else if (options.root !== false) {
    handleAsWarning('loader misconfiguration', '"root" option must be string where used or false where unused');
  }

  loader.cacheable();

  let absSourceMap = null;
  let sourceMapConsumer = null;
  if (sourceMap) {
    try {
      if (typeof sourceMap === 'string') {
        sourceMap = JSON.parse(sourceMap);
      }

      absSourceMap = adjustSourceMap(loader, { format: 'absolute' }, sourceMap);
      sourceMapConsumer = new SourceMapConsumer(absSourceMap);
    } catch (exception) {
      return handleAsError('source-map error', exception.message);
    }
  } else {
    handleAsWarning('webpack misconfiguration', 'webpack or the upstream loader did not supply a source-map');
  }

  let engine = null;
  try {
    engine = require('./lib/engine/postcss');
  } catch (error) {
    return handleAsError('error initialising', error);
  }

  const callback = loader.async();
  engine(loader.resourcePath, content, {
    outputSourceMap: !!options.sourceMap,
    absSourceMap: absSourceMap,
    sourceMapConsumer: sourceMapConsumer,
    removeCR: options.removeCR,
    transformDeclaration: valueProcessor({
      join: joinProper,
      root: options.root,
      directory: path.dirname(loader.resourcePath)
    })
  }).then(onSuccess).catch(onFailure);

  function onFailure(error) {
    callback(encodeError('error processing CSS', error));
  }

  function onSuccess(result) {
    if (result) {
      if (options.sourceMap) {
        const finalMap = adjustSourceMap(loader, {
          format: isWebpackGte5 ? 'projectRelative' : 'sourceRelative'
        }, result.map);
        callback(null, result.content, finalMap);
      } else {
        callback(null, result.content);
      }
    }
  }

  function handleAsDeprecated(code, message) {
    if (!options.silent) {
      util.deprecate(() => undefined, message, code)();
    }
    return content;
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
    return new Error(`resolve-url-loader: ${[label].concat((typeof exception === 'string') ? exception : exception instanceof Error ? [exception.message, exception.stack.split('\n')[1].trim()] : []).filter(Boolean).join('\n  ')}`);
  }
}

module.exports = Object.assign(resolveUrlLoader, joinFn);
