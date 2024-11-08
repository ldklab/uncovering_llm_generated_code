"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    const info = gen[key](arg);
    const value = info.value;
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  } catch (error) {
    reject(error);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    const self = this, args = arguments;
    return new Promise((resolve, reject) => {
      const gen = fn.apply(self, args);
      function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); }
      function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); }
      _next(undefined);
    });
  };
}

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
  throw new Error(
    "\n babel-loader@8 will not work with the '@babel/core@6' bridge package. " +
    "If you want to use Babel 6.x, install 'babel-loader@7'."
  );
}

const { version } = require("../package.json");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");
const { isAbsolute } = require("path");
const loaderUtils = require("loader-utils");
const validateOptions = require("schema-utils");

function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

module.exports = makeLoader();
module.exports.custom = makeLoader;

function makeLoader(callback) {
  const overrides = callback ? callback(babel) : undefined;
  return function(source, inputSourceMap) {
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
      if (typeof loaderOptions.customize !== "string") {
        throw new Error("Customized loaders must be implemented as standalone modules.");
      }
      if (!isAbsolute(loaderOptions.customize)) {
        throw new Error("Customized loaders must be passed as absolute paths, since " +
          "babel-loader has no way to know what they would be relative to.");
      }
      if (overrides) {
        throw new Error("babel-loader's 'customize' option is not available when already " +
          "using a customized babel-loader wrapper.");
      }
      let override = require(loaderOptions.customize);
      if (override.__esModule) override = override.default;
      if (typeof override !== "function") {
        throw new Error("Custom overrides must be functions.");
      }
      overrides = override(babel);
    }

    let customOptions;
    if (overrides && overrides.customOptions) {
      const result = yield overrides.customOptions.call(this, loaderOptions, {
        source,
        map: inputSourceMap
      });
      customOptions = result.custom;
      loaderOptions = result.loader;
    }

    if ("forceEnv" in loaderOptions) {
      console.warn("The option `forceEnv` has been removed in favor of `envName` in Babel 7.");
    }
    if (typeof loaderOptions.babelrc === "string") {
      console.warn("The option `babelrc` should not be set to a string anymore in the babel-loader config. " +
        "Please update your configuration and set `babelrc` to true or false.\n" +
        "If you want to specify a specific babel config file to inherit config from " +
        "please use the `extends` option.\nFor more information about this options see " +
        "https://babeljs.io/docs/core-packages/#options");
    }

    if (Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMap") &&
        !Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMaps")) {
      loaderOptions = Object.assign({}, loaderOptions, { sourceMaps: loaderOptions.sourceMap });
      delete loaderOptions.sourceMap;
    }

    const programmaticOptions = Object.assign({}, loaderOptions, {
      filename,
      inputSourceMap: inputSourceMap || undefined,
      sourceMaps: loaderOptions.sourceMaps === undefined ? this.sourceMap : loaderOptions.sourceMaps,
      sourceFileName: filename
    });

    delete programmaticOptions.customize;
    delete programmaticOptions.cacheDirectory;
    delete programmaticOptions.cacheIdentifier;
    delete programmaticOptions.cacheCompression;
    delete programmaticOptions.metadataSubscribers;

    if (!babel.loadPartialConfig) {
      throw new Error(`babel-loader ^8.0.0-beta.3 requires @babel/core@7.0.0-beta.41, but ` +
        `you appear to be using "${babel.version}". Either update your ` +
        `@babel/core version, or pin you babel-loader version to 8.0.0-beta.2`);
    }

    const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
    const config = yield loadPartialConfigAsync(injectCaller(programmaticOptions, this.target));

    if (config) {
      let options = config.options;
      if (overrides && overrides.config) {
        options = yield overrides.config.call(this, config, {
          source,
          map: inputSourceMap,
          customOptions
        });
      }

      if (options.sourceMaps === "inline") {
        options.sourceMaps = true;
      }

      const {
        cacheDirectory = null,
        cacheIdentifier = JSON.stringify({
          options,
          "@babel/core": transform.version,
          "@babel/loader": version
        }),
        cacheCompression = true,
        metadataSubscribers = []
      } = loaderOptions;
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

      if (typeof config.babelrc === "string") {
        this.addDependency(config.babelrc);
      }

      if (result) {
        if (overrides && overrides.result) {
          result = yield overrides.result.call(this, result, {
            source,
            map: inputSourceMap,
            customOptions,
            config,
            options
          });
        }

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
