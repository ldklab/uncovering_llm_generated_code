"use strict";

const { version } = require("../package.json");
const { isAbsolute } = require("path");
const loaderUtils = require("loader-utils");
const validateOptions = require("schema-utils");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");

let babel;
try {
  babel = require("@babel/core");
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND") {
    err.message += "\n babel-loader@8 requires Babel 7.x (the package '@babel/core'). " +
                   "For Babel 6.x ('babel-core'), install 'babel-loader@7'.";
  }
  throw err;
}

if (/^6\./.test(babel.version)) {
  throw new Error("\n babel-loader@8 will not work with '@babel/core@6'. " +
                  "For Babel 6.x, install 'babel-loader@7'.");
}

function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

module.exports = createLoader();
module.exports.custom = createLoader;

function createLoader(customCallback) {
  const customOverrides = customCallback ? customCallback(babel) : undefined;
  return function (source, inputSourceMap) {
    const callback = this.async();
    processLoader(this, source, inputSourceMap, customOverrides)
      .then(args => callback(null, ...args), err => callback(err));
  };
}

async function processLoader(context, source, inputSourceMap, overrides) {
  const filename = context.resourcePath;
  let loaderOptions = loaderUtils.getOptions(context) || {};
  validateOptions(schema, loaderOptions, { name: "Babel loader" });

  if (loaderOptions.customize) {
    if (typeof loaderOptions.customize !== "string" || !isAbsolute(loaderOptions.customize)) {
      throw new Error("Customized loaders must be standalone modules with absolute paths.");
    }
    if (overrides) {
      throw new Error("Customized loaders cannot be used with a customized wrapper.");
    }
    let customModule = require(loaderOptions.customize);
    customModule = customModule.__esModule ? customModule.default : customModule;
    if (typeof customModule !== "function") {
      throw new Error("Custom overrides must be functions.");
    }
    overrides = customModule(babel);
  }

  let customOptions;
  if (overrides && overrides.customOptions) {
    const result = await overrides.customOptions.call(context, loaderOptions, { source, map: inputSourceMap });
    customOptions = result.custom;
    loaderOptions = result.loader;
  }

  handleDeprecations(loaderOptions);

  const programmaticOptions = {
    ...loaderOptions,
    filename,
    inputSourceMap: inputSourceMap || undefined,
    sourceMaps: loaderOptions.sourceMaps === undefined ? context.sourceMap : loaderOptions.sourceMaps,
    sourceFileName: filename
  };

  cleanLoaderOptions(programmaticOptions);

  if (!babel.loadPartialConfig) {
    throw new Error(`babel-loader ^8.0.0-beta.3 requires @babel/core@7.0.0-beta.41 or higher, but found "${babel.version}".`);
  }

  const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
  const config = await loadPartialConfigAsync(injectCaller(programmaticOptions, context.target));

  if (config) {
    let options = config.options;
    if (overrides && overrides.config) {
      options = await overrides.config.call(context, config, { source, map: inputSourceMap, customOptions });
    }
    if (options.sourceMaps === "inline") {
      options.sourceMaps = true;
    }

    const cachingOptions = {
      cacheDirectory: loaderOptions.cacheDirectory || null,
      cacheIdentifier: JSON.stringify({ options, "@babel/core": transform.version, "@babel/loader": version }),
      cacheCompression: loaderOptions.cacheCompression || true,
      metadataSubscribers: loaderOptions.metadataSubscribers || []
    };

    let result;
    if (cachingOptions.cacheDirectory) {
      result = await cache({ source, options, transform, ...cachingOptions });
    } else {
      result = await transform(source, options);
    }

    if (config.babelrc && typeof config.babelrc === "string") {
      context.addDependency(config.babelrc);
    }

    if (result) {
      if (overrides && overrides.result) {
        result = await overrides.result.call(context, result, { source, map: inputSourceMap, customOptions, config, options });
      }
      const { code, map, metadata } = result;
      cachingOptions.metadataSubscribers.forEach(subscriber => subscribe(subscriber, metadata, context));
      return [code, map];
    }
  }
  return [source, inputSourceMap];
}

function handleDeprecations(loaderOptions) {
  if ("forceEnv" in loaderOptions) {
    console.warn("The `forceEnv` option is removed. Use `envName` in Babel 7.");
  }
  if (typeof loaderOptions.babelrc === "string") {
    console.warn("Set `babelrc` to true or false in babel-loader config. Use `extends` for specific config files.");
  }
  if (loaderOptions.sourceMap && !loaderOptions.sourceMaps) {
    loaderOptions.sourceMaps = loaderOptions.sourceMap;
    delete loaderOptions.sourceMap;
  }
}

function cleanLoaderOptions(options) {
  delete options.customize;
  delete options.cacheDirectory;
  delete options.cacheIdentifier;
  delete options.cacheCompression;
  delete options.metadataSubscribers;
}
