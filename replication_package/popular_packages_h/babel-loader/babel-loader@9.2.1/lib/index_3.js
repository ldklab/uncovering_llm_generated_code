let babelCore;

try {
  babelCore = require("@babel/core");
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND") {
    error.message += "\n babel-loader@9 requires Babel 7.12+ (the package '@babel/core'). " +
                     "If you'd like to use Babel 6.x ('babel-core'), you should install 'babel-loader@7'.";
  }
  throw error;
}

if (/^6\./.test(babelCore.version)) {
  throw new Error("\n babel-loader@9 will not work with the '@babel/core@6' bridge package. " +
                  "For Babel 6.x, please use 'babel-loader@7'.");
}

const { version: loaderVersion } = require("../package.json");
const cache = require("./cache");
const transform = require("./transform");
const injectCaller = require("./injectCaller");
const schema = require("./schema");
const { isAbsolute } = require("path");
const { validate } = require("schema-utils");

function subscribeMetadata(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

module.exports = createLoader();
module.exports.custom = createLoader;

function createLoader(customCallback) {
  const customOverrides = customCallback ? customCallback(babelCore) : undefined;
  return function asyncLoader(source, inputSourceMap) {
    const callback = this.async();
    processLoader.call(this, source, inputSourceMap, customOverrides)
      .then(resultArgs => callback(null, ...resultArgs))
      .catch(err => callback(err));
  };
}

async function processLoader(source, inputSourceMap, customOverrides) {
  const filePath = this.resourcePath;
  const logger = typeof this.getLogger === "function" ? this.getLogger("babel-loader") : { debug: () => {} };

  let loaderOpts = this.getOptions();
  validate(schema, loaderOpts, { name: "Babel loader" });

  if (loaderOpts.customize) {
    if (typeof loaderOpts.customize !== "string") throw new Error("Custom loaders should be standalone modules.");
    if (!isAbsolute(loaderOpts.customize)) throw new Error("Custom loaders must be passed as absolute paths.");

    if (customOverrides) throw new Error("babel-loader's 'customize' option is unavailable with custom loader wrappers.");

    logger.debug(`Loading custom override: '${loaderOpts.customize}'`);
    let customModule = require(loaderOpts.customize);

    if (customModule.__esModule) customModule = customModule.default;
    if (typeof customModule !== "function") throw new Error("Custom overrides must be functions.");

    logger.debug("Applying custom override to @babel/core");
    customOverrides = customModule(babelCore);
  }

  let derivedOptions;
  if (customOverrides && customOverrides.customOptions) {
    logger.debug("Applying customOptions() to loader options");
    const result = await customOverrides.customOptions.call(this, loaderOpts, { source, map: inputSourceMap });
    derivedOptions = result.custom;
    loaderOpts = result.loader;
  }

  if ("forceEnv" in loaderOpts) {
    console.warn("The option `forceEnv` has been removed. Use `envName` in Babel 7.");
  }

  if (typeof loaderOpts.babelrc === "string") {
    console.warn("The `babelrc` option should be a boolean in the babel-loader config. " +
                 "Use the `extends` option for inheriting config. More info: https://babeljs.io/docs/core-packages/#options");
  }

  logger.debug("Normalizing loader options");

  if (loaderOpts.hasOwnProperty("sourceMap") && !loaderOpts.hasOwnProperty("sourceMaps")) {
    loaderOpts = { ...loaderOpts, sourceMaps: loaderOpts.sourceMap };
    delete loaderOpts.sourceMap;
  }

  const babelOptions = {
    ...loaderOpts,
    filename: filePath,
    inputSourceMap: inputSourceMap || loaderOpts.inputSourceMap,
    sourceMaps: loaderOpts.sourceMaps !== undefined ? loaderOpts.sourceMaps : this.sourceMap,
    sourceFileName: filePath
  };

  delete babelOptions.customize;
  delete babelOptions.cacheDirectory;
  delete babelOptions.cacheIdentifier;
  delete babelOptions.cacheCompression;
  delete babelOptions.metadataSubscribers;

  logger.debug("Resolving Babel configurations");
  const babelConfig = await babelCore.loadPartialConfigAsync(injectCaller(babelOptions, this.target));

  if (babelConfig) {
    const configOptions = babelConfig.options;
    if (customOverrides && customOverrides.config) {
      logger.debug("Applying config overrides to Babel config");
      configOptions = await customOverrides.config.call(this, babelConfig, {
        source,
        map: inputSourceMap,
        customOptions: derivedOptions
      });
    }

    if (configOptions.sourceMaps === "inline") {
      configOptions.sourceMaps = true;
    }

    const {
      cacheDirectory = null,
      cacheIdentifier = JSON.stringify({
        options: configOptions,
        "@babel/core": transform.version,
        "@babel/loader": loaderVersion
      }),
      cacheCompression = true,
      metadataSubscribers = []
    } = loaderOpts;

    let transformationResult;
    if (cacheDirectory) {
      logger.debug("Cache is enabled");
      transformationResult = await cache({
        source,
        options: configOptions,
        transform,
        cacheDirectory,
        cacheIdentifier,
        cacheCompression,
        logger
      });
    } else {
      logger.debug("Cache is disabled, performing Babel transformation");
      transformationResult = await transform(source, configOptions);
    }

    babelConfig.files.forEach(configFile => {
      this.addDependency(configFile);
      logger.debug(`Added '${configFile}' to Webpack dependencies`);
    });

    if (transformationResult) {
      if (customOverrides && customOverrides.result) {
        logger.debug("Applying result overrides to Babel transform results");
        transformationResult = await customOverrides.result.call(this, transformationResult, {
          source,
          map: inputSourceMap,
          customOptions: derivedOptions,
          config: babelConfig,
          options: configOptions
        });
      }

      const { code, map, metadata, externalDependencies } = transformationResult;

      externalDependencies?.forEach(dependency => {
        this.addDependency(dependency);
        logger.debug(`Added '${dependency}' to Webpack dependencies`);
      });

      metadataSubscribers.forEach(subscriber => {
        subscribeMetadata(subscriber, metadata, this);
        logger.debug(`Invoked metadata subscriber '${String(subscriber)}'`);
      });

      return [code, map];
    }
  }

  return [source, inputSourceMap];
}
