"use strict";

const path = require("path");
const os = require("os");
const { validate } = require("schema-utils");
const { 
  throttleAll, 
  memoize, 
  terserMinify, 
  uglifyJsMinify, 
  swcMinify, 
  esbuildMinify 
} = require("./utils");
const schema = require("./options.json");
const { minify } = require("./minify");

class TerserPlugin {
  constructor(options) {
    validate(schema, options || {}, {
      name: "Terser Plugin",
      baseDataPath: "options"
    });

    const {
      minify = terserMinify,
      terserOptions = {},
      test = /\.[cm]?js(\?.*)?$/i,
      extractComments = true,
      parallel = true,
      include,
      exclude
    } = options || {};

    this.options = {
      test,
      extractComments,
      parallel,
      include,
      exclude,
      minimizer: {
        implementation: minify,
        options: terserOptions
      }
    };
  }

  static isSourceMap(input) {
    return Boolean(input && input.version && input.sources && 
                   Array.isArray(input.sources) && typeof input.mappings === "string");
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
      builtError = new Error(`${file} from Terser plugin\n${error}`);
      builtError.file = file;
      return builtError;
    }

    if (error.line) {
      const original = sourceMap && getTraceMapping().originalPositionFor(sourceMap, {
        line: error.line,
        column: error.col
      });

      if (original && original.source && requestShortener) {
        builtError = new Error(`${file} from Terser plugin\n${error.message} ` +
                               `[${requestShortener.shorten(original.source)}:${original.line},` +
                               `${original.column}][${file}:${error.line},${error.col}]` +
                               `${error.stack ? `\n${error.stack.split("\n").slice(1).join("\n")}` : ""}`);
        builtError.file = file;
        return builtError;
      }

      builtError = new Error(`${file} from Terser plugin\n${error.message} ` +
                             `[${file}:${error.line},${error.col}]` +
                             `${error.stack ? `\n${error.stack.split("\n").slice(1).join("\n")}` : ""}`);
      builtError.file = file;
      return builtError;
    }

    if (error.stack) {
      builtError = new Error(`${file} from Terser plugin\n${error.message}\n${error.stack}`);
      builtError.file = file;
      return builtError;
    }

    builtError = new Error(`${file} from Terser plugin\n${error.message}`);
    builtError.file = file;
    return builtError;
  }

  static getAvailableNumberOfCores(parallel) {
    const cpus = os.cpus() || { length: 1 };
    return parallel === true ? cpus.length - 1 : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async optimize(compiler, compilation, assets, { availableNumberOfCores }) {
    const cache = compilation.getCache("TerserWebpackPlugin");
    let numberOfAssets = 0;

    const assetsForMinify = await Promise.all(
      Object.keys(assets).filter(name => {
        const { info } = compilation.getAsset(name);
        if (info.minimized || info.extractedComments) {
          return false;
        }
        if (!compiler.webpack.ModuleFilenameHelpers.matchObject(this.options)(name)) {
          return false;
        }
        return true;
      }).map(async name => {
        const { info, source } = compilation.getAsset(name);
        const eTag = cache.getLazyHashedEtag(source);
        const cacheItem = cache.getItemCache(name, eTag);
        const output = await cacheItem.getPromise();
        if (!output) {
          numberOfAssets++;
        }
        return { name, info, inputSource: source, output, cacheItem };
      })
    );

    if (assetsForMinify.length === 0) return;

    let getWorker, initializedWorker, numberOfWorkers;
    if (availableNumberOfCores > 0) {
      numberOfWorkers = Math.min(numberOfAssets, availableNumberOfCores);
      getWorker = () => {
        if (initializedWorker) return initializedWorker;
        const { Worker } = require("jest-worker");
        initializedWorker = new Worker(require.resolve("./minify"), {
          numWorkers: numberOfWorkers,
          enableWorkerThreads: true
        });

        const workerStdout = initializedWorker.getStdout();
        if (workerStdout) workerStdout.on("data", chunk => process.stdout.write(chunk));
        const workerStderr = initializedWorker.getStderr();
        if (workerStderr) workerStderr.on("data", chunk => process.stderr.write(chunk));
        return initializedWorker;
      };
    }

    const { SourceMapSource, ConcatSource, RawSource } = compiler.webpack.sources;
    const allExtractedComments = new Map();
    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(async () => {
        const { name, inputSource, info, cacheItem } = asset;
        let { output } = asset;
        if (!output) {
          let input;
          let inputSourceMap;
          const { source: sourceFromInputSource, map } = inputSource.sourceAndMap();
          input = sourceFromInputSource;
          if (map) {
            if (!TerserPlugin.isSourceMap(map)) {
              compilation.warnings.push(new Error(`${name} contains invalid source map`));
            } else {
              inputSourceMap = map;
            }
          }

          if (Buffer.isBuffer(input)) {
            input = input.toString();
          }

          const options = {
            name,
            input,
            inputSourceMap,
            minimizer: {
              implementation: this.options.minimizer.implementation,
              options: { ...this.options.minimizer.options }
            },
            extractComments: this.options.extractComments
          };

          if (typeof options.minimizer.options.module === "undefined") {
            if (typeof info.javascriptModule !== "undefined") {
              options.minimizer.options.module = info.javascriptModule;
            } else if (/\.mjs(\?.*)?$/i.test(name)) {
              options.minimizer.options.module = true;
            } else if (/\.cjs(\?.*)?$/i.test(name)) {
              options.minimizer.options.module = false;
            }
          }
          if (typeof options.minimizer.options.ecma === "undefined") {
            options.minimizer.options.ecma = TerserPlugin.getEcmaVersion(compiler.options.output.environment || {});
          }

          try {
            output = await (getWorker ? getWorker().transform(getSerializeJavascript()(options)) : minify(options));
          } catch (error) {
            const hasSourceMap = inputSourceMap && TerserPlugin.isSourceMap(inputSourceMap);
            compilation.errors.push(TerserPlugin.buildError(
              error, 
              name, 
              hasSourceMap ? new (getTraceMapping().TraceMap)(inputSourceMap) : undefined, 
              hasSourceMap ? compilation.requestShortener : undefined
            ));
            return;
          }

          if (typeof output.code === "undefined") {
            compilation.errors.push(new Error(`Minimizer doesn't return result for ${name}`));
            return;
          }

          if (output.warnings && output.warnings.length > 0) {
            output.warnings = output.warnings.map(item => TerserPlugin.buildWarning(item, name));
          }

          if (output.errors && output.errors.length > 0) {
            const hasSourceMap = inputSourceMap && TerserPlugin.isSourceMap(inputSourceMap);
            output.errors = output.errors.map(item => TerserPlugin.buildError(
              item, 
              name, 
              hasSourceMap ? new (getTraceMapping().TraceMap)(inputSourceMap) : undefined, 
              hasSourceMap ? compilation.requestShortener : undefined
            ));
          }

          let shebang;
          if (this.options.extractComments.banner !== false && 
              output.extractedComments && 
              output.extractedComments.length > 0 && 
              output.code.startsWith("#!")) {
            const firstNewlinePosition = output.code.indexOf("\n");
            shebang = output.code.substring(0, firstNewlinePosition);
            output.code = output.code.substring(firstNewlinePosition + 1);
          }

          if (output.map) {
            output.source = new SourceMapSource(output.code, name, output.map, input, inputSourceMap, true);
          } else {
            output.source = new RawSource(output.code);
          }

          if (output.extractedComments && output.extractedComments.length > 0) {
            const commentsFilename = this.options.extractComments.filename || "[file].LICENSE.txt[query]";
            let query = "";
            let filename = name;
            const querySplit = filename.indexOf("?");
            if (querySplit >= 0) {
              query = filename.slice(querySplit);
              filename = filename.slice(0, querySplit);
            }

            const lastSlashIndex = filename.lastIndexOf("/");
            const basename = lastSlashIndex === -1 ? filename : filename.slice(lastSlashIndex + 1);
            const data = { filename, basename, query };
            output.commentsFilename = compilation.getPath(commentsFilename, data);

            let banner;
            if (this.options.extractComments.banner !== false) {
              banner = this.options.extractComments.banner || 
                       `For license information please see ${path.relative(path.dirname(name), output.commentsFilename).replace(/\\/g, "/")}`;

              if (typeof banner === "function") {
                banner = banner(output.commentsFilename);
              }

              if (banner) {
                output.source = new ConcatSource(shebang ? `${shebang}\n` : "", `/*! ${banner} */\n`, output.source);
              }
            }

            const extractedCommentsString = output.extractedComments.sort().join("\n\n");
            output.extractedCommentsSource = new RawSource(`${extractedCommentsString}\n`);
          }

          await cacheItem.storePromise({
            source: output.source,
            errors: output.errors,
            warnings: output.warnings,
            commentsFilename: output.commentsFilename,
            extractedCommentsSource: output.extractedCommentsSource
          });
        }

        if (output.warnings && output.warnings.length > 0) {
          compilation.warnings.push(...output.warnings);
        }

        if (output.errors && output.errors.length > 0) {
          compilation.errors.push(...output.errors);
        }

        const newInfo = { minimized: true };
        const { source, extractedCommentsSource } = output;

        if (extractedCommentsSource) {
          const { commentsFilename } = output;
          newInfo.related = { license: commentsFilename };
          allExtractedComments.set(name, { extractedCommentsSource, commentsFilename });
        }
        compilation.updateAsset(name, source, newInfo);
      });
    }

    const limit = getWorker ? Math.max(numberOfWorkers, scheduledTasks.length) : scheduledTasks.length;
    await throttleAll(limit, scheduledTasks);

    if (initializedWorker) {
      await initializedWorker.end();
    }

    await Array.from(allExtractedComments).sort().reduce(async (previousPromise, [from, value]) => {
      const previous = await previousPromise;
      const { commentsFilename, extractedCommentsSource } = value;

      if (previous && previous.commentsFilename === commentsFilename) {
        const { from: previousFrom, source: prevSource } = previous;
        const mergedName = `${previousFrom}|${from}`;
        const name = `${commentsFilename}|${mergedName}`;
        const eTag = [prevSource, extractedCommentsSource]
          .map(item => cache.getLazyHashedEtag(item))
          .reduce((previousValue, currentValue) => cache.mergeEtags(previousValue, currentValue));

        let source = await cache.getPromise(name, eTag);
        if (!source) {
          source = new ConcatSource(Array.from(new Set([
            ...prevSource.source().split("\n\n"),
            ...extractedCommentsSource.source().split("\n\n")
          ])).join("\n\n"));
          await cache.storePromise(name, eTag, source);
        }
        compilation.updateAsset(commentsFilename, source);
        return { source, commentsFilename, from: mergedName };
      }

      const existingAsset = compilation.getAsset(commentsFilename);
      if (existingAsset) {
        return { source: existingAsset.source, commentsFilename, from: commentsFilename };
      }

      compilation.emitAsset(commentsFilename, extractedCommentsSource, { extractedComments: true });
      return { source: extractedCommentsSource, commentsFilename, from };
    }, Promise.resolve());
  }

  static getEcmaVersion(environment) {
    if (environment.arrowFunction || environment.const || environment.destructuring || environment.forOf || environment.module) {
      return 2015;
    }
    if (environment.bigIntLiteral || environment.dynamicImport) {
      return 2020;
    }
    return 5;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    const availableNumberOfCores = TerserPlugin.getAvailableNumberOfCores(this.options.parallel);

    compiler.hooks.compilation.tap(pluginName, compilation => {
      const hooks = compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);
      const data = getSerializeJavascript()({
        minimizer: this.options.minimizer.implementation.getMinimizerVersion ? 
                   this.options.minimizer.implementation.getMinimizerVersion() || "0.0.0" : "0.0.0",
        options: this.options.minimizer.options
      });

      hooks.chunkHash.tap(pluginName, (chunk, hash) => {
        hash.update("TerserPlugin");
        hash.update(data);
      });

      compilation.hooks.processAssets.tapPromise({
        name: pluginName,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        additionalAssets: true
      }, assets => this.optimize(compiler, compilation, assets, { availableNumberOfCores }));

      compilation.hooks.statsPrinter.tap(pluginName, stats => {
        stats.hooks.print.for("asset.info.minimized").tap("terser-webpack-plugin", 
          (minimized, { green, formatFlag }) => minimized ? green(formatFlag("minimized")) : "");
      });
    });
  }
}

TerserPlugin.terserMinify = terserMinify;
TerserPlugin.uglifyJsMinify = uglifyJsMinify;
TerserPlugin.swcMinify = swcMinify;
TerserPlugin.esbuildMinify = esbuildMinify;
module.exports = TerserPlugin;
