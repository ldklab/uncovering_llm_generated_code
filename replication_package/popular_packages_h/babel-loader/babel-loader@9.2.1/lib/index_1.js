let babel;
try {
  babel = require("@babel/core");
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND") {
    err.message += "\n babel-loader@9 requires Babel 7.12+ (the package '@babel/core'). " +
                   "If you'd like to use Babel 6.x ('babel-core'), you should install 'babel-loader@7'.";
  }
  throw err;
}

if (/^6\./.test(babel.version)) {
  throw new Error("\n babel-loader@9 will not work with the '@babel/core@6' bridge package. " +
                  "If you want to use Babel 6.x, install 'babel-loader@7'.");
}

const { version } = require("../package.json");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");
const { isAbsolute } = require("path");
const { validate } = require("schema-utils");

function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

module.exports = makeLoader();
module.exports.custom = makeLoader;

function makeLoader(callback) {
  const overrides = callback ? callback(babel) : undefined;
  return function (source, inputSourceMap) {
    const callback = this.async();
    loader.call(this, source, inputSourceMap, overrides).then(
      args => callback(null, ...args), 
      err => callback(err)
    );
  };
}

async function loader(source, inputSourceMap, overrides) {
  const filename = this.resourcePath;
  const logger = typeof this.getLogger === "function"
    ? this.getLogger("babel-loader")
    : { debug: () => {} };

  let loaderOptions = this.getOptions();
  validate(schema, loaderOptions, { name: "Babel loader" });

  if (loaderOptions.customize) {
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
    
    logger.debug(`loading customize override: '${loaderOptions.customize}'`);
    let override = require(loaderOptions.customize);
    if (override.__esModule) override = override.default;

    if (typeof override !== "function") {
      throw new Error("Custom overrides must be functions.");
    }

    logger.debug("applying customize override to @babel/core");
    overrides = override(babel);
  }

  let customOptions;
  if (overrides && overrides.customOptions) {
    logger.debug("applying overrides customOptions() to loader options");
    const result = await overrides.customOptions.call(this, loaderOptions, {
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

  logger.debug("normalizing loader options");
  if (Object.hasOwnProperty.call(loaderOptions, "sourceMap") && 
      !Object.hasOwnProperty.call(loaderOptions, "sourceMaps")) {
    loaderOptions = Object.assign({}, loaderOptions, {
      sourceMaps: loaderOptions.sourceMap
    });
    delete loaderOptions.sourceMap;
  }

  const programmaticOptions = Object.assign({}, loaderOptions, {
    filename,
    inputSourceMap: inputSourceMap || loaderOptions.inputSourceMap,
    sourceMaps: loaderOptions.sourceMaps === undefined ? this.sourceMap : loaderOptions.sourceMaps,
    sourceFileName: filename
  });

  delete programmaticOptions.customize;
  delete programmaticOptions.cacheDirectory;
  delete programmaticOptions.cacheIdentifier;
  delete programmaticOptions.cacheCompression;
  delete programmaticOptions.metadataSubscribers;

  logger.debug("resolving Babel configs");
  const config = await babel.loadPartialConfigAsync(injectCaller(programmaticOptions, this.target));

  if (config) {
    let options = config.options;
    if (overrides && overrides.config) {
      logger.debug("applying overrides config() to Babel config");
      options = await overrides.config.call(this, config, {
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
      logger.debug("cache is enabled");
      result = await cache({
        source,
        options,
        transform,
        cacheDirectory,
        cacheIdentifier,
        cacheCompression,
        logger
      });
    } else {
      logger.debug("cache is disabled, applying Babel transform");
      result = await transform(source, options);
    }

    config.files.forEach(configFile => {
      this.addDependency(configFile);
      logger.debug(`added '${configFile}' to webpack dependencies`);
    });

    if (result) {
      if (overrides && overrides.result) {
        logger.debug("applying overrides result() to Babel transform results");
        result = await overrides.result.call(this, result, {
          source,
          map: inputSourceMap,
          customOptions,
          config,
          options
        });
      }

      const { code, map, metadata, externalDependencies } = result;

      externalDependencies?.forEach(dep => {
        this.addDependency(dep);
        logger.debug(`added '${dep}' to webpack dependencies`);
      });

      metadataSubscribers.forEach(subscriber => {
        subscribe(subscriber, metadata, this);
        logger.debug(`invoked metadata subscriber '${String(subscriber)}'`);
      });

      return [code, map];
    }
  }

  return [source, inputSourceMap];
}
