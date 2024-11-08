"use strict";

const path = require("path");
const os = require("os");
const { validate } = require("schema-utils");
const { throttleAll, memoize, terserMinify, uglifyJsMinify, swcMinify, esbuildMinify } = require("./utils");
const schema = require("./options.json");
const { minify } = require("./minify");

class TerserPlugin {
  constructor(options = {}) {
    validate(schema, options, { name: "Terser Plugin", baseDataPath: "options" });
    this.options = {
      test: /\.[cm]?js(\?.*)?$/i,
      extractComments: true,
      parallel: true,
      ...options
    };
  }

  static isSourceMap(input) {
    return Boolean(input && input.version && input.sources && Array.isArray(input.sources) && typeof input.mappings === "string");
  }

  static buildWarning(warning, file) {
    const builtWarning = new Error(warning.toString());
    builtWarning.name = "Warning";
    builtWarning.hideStack = true;
    builtWarning.file = file;
    return builtWarning;
  }

  static buildError(error, file, sourceMap, requestShortener) {
    let builtError;
    if (typeof error === "string") {
      return new Error(`${file} from Terser plugin\n${error}`);
    }
    if (error.line) {
      const original = sourceMap && require("@jridgewell/trace-mapping").originalPositionFor(sourceMap, { line: error.line, column: error.col });
      if (original && original.source && requestShortener) {
        return new Error(`${file} from Terser plugin\n${error.message} [${requestShortener.shorten(original.source)}:${original.line},${original.column}][${file}:${error.line},${error.col}]`);
      }
      return new Error(`${file} from Terser plugin\n${error.message} [${file}:${error.line},${error.col}]`);
    }
    return new Error(`${file} from Terser plugin\n${error.message}`);
  }

  static getAvailableNumberOfCores(parallel) {
    const cpus = os.cpus() || { length: 1 };
    return parallel === true ? cpus.length - 1 : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async optimize(compiler, compilation, assets, optimizeOptions) {
    const cache = compilation.getCache("TerserWebpackPlugin");
    const assetsForMinify = await Promise.all(Object.keys(assets).filter((name) => {
      const { info } = compilation.getAsset(name);
      return !info.minimized && !info.extractedComments && compiler.webpack.ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(name);
    }).map(async (name) => {
      const { info, source } = compilation.getAsset(name);
      const eTag = cache.getLazyHashedEtag(source);
      const cacheItem = cache.getItemCache(name, eTag);
      const output = await cacheItem.getPromise();
      return { name, info, inputSource: source, output, cacheItem };
    }));

    if (!assetsForMinify.length) return;

    const { minimizer } = this.options;
    const tasks = assetsForMinify.map(async ({ name, inputSource, cacheItem }) => {
      const { source: sourceFromInputSource, map } = inputSource.sourceAndMap();
      const input = Buffer.isBuffer(sourceFromInputSource) ? sourceFromInputSource.toString() : sourceFromInputSource;
      const inputSourceMap = TerserPlugin.isSourceMap(map) ? map : undefined;

      const minifyOptions = { name, input, inputSourceMap, minimizer: { implementation: minimizer.implementation, options: minimizer.options } };
      let output;

      try {
        output = await minify(minifyOptions);
      } catch (error) {
        compilation.errors.push(TerserPlugin.buildError(error, name, inputSourceMap, compilation.requestShortener));
        return;
      }

      await cacheItem.storePromise({ source: output.source, errors: output.errors, warnings: output.warnings });
    });

    await throttleAll(TerserPlugin.getAvailableNumberOfCores(this.options.parallel), tasks);
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise({ name: pluginName, stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE }, (assets) => 
        this.optimize(compiler, compilation, assets, { availableNumberOfCores: TerserPlugin.getAvailableNumberOfCores(this.options.parallel) }));
    });
  }
}

TerserPlugin.terserMinify = terserMinify;
TerserPlugin.uglifyJsMinify = uglifyJsMinify;
TerserPlugin.swcMinify = swcMinify;
TerserPlugin.esbuildMinify = esbuildMinify;

module.exports = TerserPlugin;
