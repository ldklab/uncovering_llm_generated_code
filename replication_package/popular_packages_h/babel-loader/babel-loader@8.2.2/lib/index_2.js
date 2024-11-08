"use strict";

const { version } = require("../package.json");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");
const loaderUtils = require("loader-utils");
const { isAbsolute } = require("path");
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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this, args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); }
      function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); }
      _next(undefined);
    });
  };
}

module.exports = makeLoader();
module.exports.custom = makeLoader;

function makeLoader(callback) {
  const overrides = callback ? callback(babel) : undefined;
  return function (source, inputSourceMap) {
    const callback = this.async();
    loader.call(this, source, inputSourceMap, overrides)
      .then(args => callback(null, ...args), err => callback(err));
  };
}

function loader(_x, _x2, _x3) {
  return _loader.apply(this, arguments);
}

function _loader() {
  _loader = _asyncToGenerator(function* (source, inputSourceMap, overrides) {
    const filename = this.resourcePath;
    let loaderOptions = loaderUtils.getOptions(this) || {};
    validateOptions(schema, loaderOptions, { name: "Babel loader" });

    if (loaderOptions.customize != null) {
      validateCustomization(loaderOptions, overrides);
    }

    let customOptions;
    if (overrides && overrides.customOptions) {
      const result = yield overrides.customOptions.call(this, loaderOptions, { source, map: inputSourceMap });
      customOptions = result.custom;
      loaderOptions = result.loader;
    }
    
    handleDeprecationWarnings(loaderOptions);

    const programmaticOptions = prepareOptions(loaderOptions, filename, inputSourceMap);

    if (!babel.loadPartialConfig) {
      throw new Error(`babel-loader ^8.0.0-beta.3 requires @babel/core@7.0.0-beta.41, but ` +
                      `you appear to be using "${babel.version}". Either update your ` +
                      `@babel/core version, or pin your babel-loader version to 8.0.0-beta.2`);
    }

    const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
    const config = yield loadPartialConfigAsync(injectCaller(programmaticOptions, this.target));

    if (config) {
      let options = config.options;
      if (overrides && overrides.config) {
        options = yield overrides.config.call(this, config, { source, map: inputSourceMap, customOptions });
      }

      options.sourceMaps = options.sourceMaps === "inline" ? true : options.sourceMaps;

      const { cacheDirectory, cacheIdentifier, cacheCompression, metadataSubscribers } = processLoaderOptions(loaderOptions, options);

      let result;
      if (cacheDirectory) {
        result = yield cache({
          source,
          options,
          transform,
          cacheDirectory,
          cacheIdentifier,
          cacheCompression
        });
      } else {
        result = yield transform(source, options);
      }

      handleDependencies(config, this);

      if (result) {
        result = processResult(result, { source, map: inputSourceMap, customOptions, config, options, overrides });

        const { code, map, metadata } = result;
        metadataSubscribers.forEach(subscriber => {
          subscribe(subscriber, metadata, this);
        });
        return [code, map];
      }
    }

    return [source, inputSourceMap];
  });
  return _loader.apply(this, arguments);
}

function validateCustomization(loaderOptions, overrides) {
  if (typeof loaderOptions.customize !== "string") {
    throw new Error("Customized loaders must be implemented as standalone modules.");
  }
  if (!isAbsolute(loaderOptions.customize)) {
    throw new Error("Customized loaders must be passed as absolute paths.");
  }
  if (overrides) {
    throw new Error("babel-loader's 'customize' option is not available when using a customized wrapper.");
  }
}

function handleDeprecationWarnings(loaderOptions) {
  if ("forceEnv" in loaderOptions) {
    console.warn("The option `forceEnv` has been removed in favor of `envName` in Babel 7.");
  }
  if (typeof loaderOptions.babelrc === "string") {
    console.warn("The option `babelrc` should not be a string in the babel-loader config. Update to true or false.");
  }
  if (Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMap") &&
      !Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMaps")) {
    loaderOptions = { ...loaderOptions, sourceMaps: loaderOptions.sourceMap };
    delete loaderOptions.sourceMap;
  }
}

function prepareOptions(loaderOptions, filename, inputSourceMap) {
  return {
    ...loaderOptions,
    filename,
    inputSourceMap: inputSourceMap || undefined,
    sourceMaps: loaderOptions.sourceMaps === undefined ? this.sourceMap : loaderOptions.sourceMaps,
    sourceFileName: filename
  };
}

function processLoaderOptions(loaderOptions, options) {
  const cacheDirectory = null;
  const cacheIdentifier = JSON.stringify({
    options,
    "@babel/core": transform.version,
    "@babel/loader": version
  });
  const cacheCompression = true;
  const metadataSubscribers = loaderOptions.metadataSubscribers || [];
  return { cacheDirectory, cacheIdentifier, cacheCompression, metadataSubscribers };
}

function handleDependencies(config, context) {
  if (typeof config.babelrc === "string") {
    context.addDependency(config.babelrc);
  }
}

function processResult(result, { source, map, customOptions, config, options, overrides }) {
  if (overrides && overrides.result) {
    return yield overrides.result.call(this, result, { source, map, customOptions, config, options });
  }
  return result;
}

function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}
