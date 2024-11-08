"use strict";

const path = require("path");
const loaderUtils = require("loader-utils");
const validateOptions = require("schema-utils");
let babel;

try {
  babel = require("@babel/core");
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND") {
    err.message += "\n babel-loader@8 requires Babel 7.x (the package '@babel/core'). " +
                   "If you'd like to use Babel 6.x ('babel-core'), you should install 'babel-loader@7'.";
  }
  throw err;
}

if (/^6\./.test(babel.version)) {
  throw new Error("\n babel-loader@8 will not work with the '@babel/core@6' bridge package. " +
                  "If you want to use Babel 6.x, install 'babel-loader@7'.");
}

const { version } = require("../package.json");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");

function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

module.exports = createLoader();
module.exports.custom = createLoader;

function createLoader(callback) {
  const overrides = callback ? callback(babel) : undefined;
  return function (source, inputSourceMap) {
    const callback = this.async();
    processSource.call(this, source, inputSourceMap, overrides)
      .then(args => callback(null, ...args), err => callback(err));
  };
}

async function processSource(source, inputSourceMap, overrides) {
  const filename = this.resourcePath;
  let loaderOptions = loaderUtils.getOptions(this) || {};
  validateOptions(schema, loaderOptions, { name: "Babel loader" });

  if (loaderOptions.customize != null) {
    validateCustomizeOption(loaderOptions.customize);
    let override = require(loaderOptions.customize);
    if (override.__esModule) override = override.default;
    overrides = override && typeof override === "function" ? override(babel) : null;
  }

  let customOptions;
  if (overrides && overrides.customOptions) {
    const result = await overrides.customOptions.call(this, loaderOptions, { source, map: inputSourceMap });
    customOptions = result.custom;
    loaderOptions = result.loader;
  }

  handleDeprecations(loaderOptions);

  const programmaticOptions = createProgrammaticOptions(loaderOptions, filename, inputSourceMap, this.sourceMap);
  const config = await loadConfig(programmaticOptions);

  if (config) {
    let options = config.options;
    if (overrides && overrides.config) {
      options = await overrides.config.call(this, config, { source, map: inputSourceMap, customOptions });
    }

    const transformed = await executeTransform(source, options, loaderOptions);
    saveDependencies(config.babelrc);

    if (transformed) {
      if (overrides && overrides.result) {
        transformed.result = await overrides.result.call(this, transformed.result, {
          source,
          map: inputSourceMap,
          customOptions,
          config,
          options
        });
      }
      notifySubscribers(loaderOptions.metadataSubscribers, transformed.metadata, this);
      return [transformed.code, transformed.map];
    }
  }

  return [source, inputSourceMap];
}

function validateCustomizeOption(customize) {
  if (typeof customize !== "string") {
    throw new Error("Customized loaders must be implemented as standalone modules.");
  }
  if (!path.isAbsolute(customize)) {
    throw new Error("Customized loaders must be passed as absolute paths.");
  }
}

function handleDeprecations(loaderOptions) {
  if ("forceEnv" in loaderOptions) {
    console.warn("The option `forceEnv` has been removed in favor of `envName` in Babel 7.");
  }
  if (typeof loaderOptions.babelrc === "string") {
    console.warn("`babelrc` should not be a string. Use `extends` for config file inheritance.");
  }
}

function createProgrammaticOptions(loaderOptions, filename, inputSourceMap, sourceMap) {
  if (loaderOptions.sourceMap && !loaderOptions.sourceMaps) {
    loaderOptions = { ...loaderOptions, sourceMaps: loaderOptions.sourceMap };
    delete loaderOptions.sourceMap;
  }
  return {
    ...loaderOptions,
    filename,
    inputSourceMap: inputSourceMap || undefined,
    sourceMaps: loaderOptions.sourceMaps === undefined ? sourceMap : loaderOptions.sourceMaps,
    sourceFileName: filename
  };
}

async function loadConfig(options) {
  const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
  return loadPartialConfigAsync(injectCaller(options, this.target));
}

async function executeTransform(source, options, loaderOptions) {
  if (options.sourceMaps === "inline") {
    options.sourceMaps = true;
  }
  if (loaderOptions.cacheDirectory) {
    return cache({
      source, options, transform,
      cacheDirectory: loaderOptions.cacheDirectory,
      cacheIdentifier: loaderOptions.cacheIdentifier,
      cacheCompression: loaderOptions.cacheCompression
    });
  }
  return transform(source, options);
}

function saveDependencies(babelrc) {
  if (typeof babelrc === "string") {
    this.addDependency(babelrc);
  }
}

function notifySubscribers(subscribers, metadata, context) {
  subscribers.forEach(subscriber => subscribe(subscriber, metadata, context));
}
