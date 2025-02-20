"use strict";

const path = require("path");
const { validate } = require("schema-utils");
const { version } = require("../package.json");
const schema = require("./options.json");
const { readFile, stat, throttleAll, memoize } = require("./utils");
const template = /\[\\*([\w:]+)\\*\]/i;

const getNormalizePath = memoize(() => require("normalize-path"));
const getGlobParent = memoize(() => require("glob-parent"));
const getSerializeJavascript = memoize(() => require("serialize-javascript"));
const getFastGlob = memoize(() => require("fast-glob"));
const getGlobby = memoize(async () => {
  const { globby } = await import("globby");
  return globby;
});

/**
 * @typedef {import("schema-utils/declarations/validate").Schema} Schema
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").Compilation} Compilation
 * @typedef {import("webpack").WebpackError} WebpackError
 * @typedef {import("webpack").Asset} Asset
 * @typedef {import("globby").Options} GlobbyOptions
 * @typedef {import("globby").GlobEntry} GlobEntry
 * @typedef {ReturnType<Compilation["getLogger"]>} WebpackLogger
 * @typedef {ReturnType<Compilation["getCache"]>} CacheFacade
 * @typedef {ReturnType<ReturnType<Compilation["getCache"]>["getLazyHashedEtag"]>} Etag
 * @typedef {ReturnType<Compilation["fileSystemInfo"]["mergeSnapshots"]>} Snapshot
 */

/**
 * @typedef {boolean} Force
 * @typedef {Object} CopiedResult
 * @property {string} sourceFilename
 * @property {string} absoluteFilename
 * @property {string} filename
 * @property {Asset["source"]} source
 * @property {Force | undefined} force
 * @property {Record<string, any>} info
 * @typedef {string} StringPattern
 * @typedef {boolean} NoErrorOnMissing
 * @typedef {string} Context
 * @typedef {string} From
 * @callback ToFunction
 * @param {{ context: string, absoluteFilename?: string }} pathData
 * @return {string | Promise<string>}
 * @typedef {string | ToFunction} To
 * @typedef {"dir" | "file" | "template"} ToType
 * @callback TransformerFunction
 * @param {Buffer} input
 * @param {string} absoluteFilename
 * returns {string | Buffer | Promise<string> | Promise<Buffer>}
 * @typedef {{ keys: {[key: string]: any} } | { keys: ((defaultCacheKeys: { [key: string]: any }, absoluteFilename: string) => Promise<{ [key: string]: any }>) }} TransformerCacheObject
 * @typedef {Object} TransformerObject
 * @property {TransformerFunction} transformer
 * @property {boolean | TransformerCacheObject} [cache]
 * @typedef {TransformerFunction | TransformerObject} Transform
 * @callback Filter
 * @param {string} filepath
 * @returns {boolean | Promise<boolean>}
 * @callback TransformAllFunction
 * @param {{ data: Buffer, sourceFilename: string, absoluteFilename: string }[]} data
 * @returns {string | Buffer | Promise<string> | Promise<Buffer>}
 * @typedef {Record<string, any> | ((item: { absoluteFilename: string, sourceFilename: string, filename: string, toType: ToType }) => Record<string, any>)} Info
 * @typedef {Object} ObjectPattern
 * @property {From} from
 * @property {GlobbyOptions} [globOptions]
 * @property {Context} [context]
 * @property {To} [to]
 * @property {ToType} [toType]
 * @property {Info} [info]
 * @property {Filter} [filter]
 * @property {Transform} [transform]
 * @property {TransformAllFunction} [transformAll]
 * @property {Force} [force]
 * @property {number} [priority]
 * @property {NoErrorOnMissing} [noErrorOnMissing]
 * @typedef {StringPattern | ObjectPattern} Pattern
 * @typedef {Object} AdditionalOptions
 * @property {number} [concurrency]
 * @typedef {Object} PluginOptions
 * @property {Pattern[]} patterns
 * @property {AdditionalOptions} [options]
 */

class CopyPlugin {
  /**
   * @param {PluginOptions} [options]
   */
  constructor(options = { patterns: [] }) {
    validate(schema, options, { name: "Copy Plugin", baseDataPath: "options" });
    this.patterns = options.patterns;
    this.options = options.options || {};
  }

  /**
   * @private
   * @param {Compilation} compilation
   * @param {number} startTime
   * @param {string} dependency
   * @returns {Promise<Snapshot | undefined>}
   */
  static async createSnapshot(compilation, startTime, dependency) {
    return new Promise((resolve, reject) => {
      compilation.fileSystemInfo.createSnapshot(startTime, [dependency], undefined, undefined, null, (error, snapshot) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(snapshot);
      });
    });
  }

  /**
   * @private
   * @param {Compilation} compilation
   * @param {Snapshot} snapshot
   * @returns {Promise<boolean | undefined>}
   */
  static async checkSnapshotValid(compilation, snapshot) {
    return new Promise((resolve, reject) => {
      compilation.fileSystemInfo.checkSnapshotValid(snapshot, (error, isValid) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(isValid);
      });
    });
  }

  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Buffer} source
   * @returns {string}
   */
  static getContentHash(compiler, compilation, source) {
    const { outputOptions } = compilation;
    const { hashDigest, hashDigestLength, hashFunction, hashSalt } = outputOptions;
    const hash = compiler.webpack.util.createHash(hashFunction);
    if (hashSalt) hash.update(hashSalt);
    hash.update(source);
    return hash.digest(hashDigest).toString().slice(0, hashDigestLength);
  }

  /**
   * @private
   * @param {typeof import("globby").globby} globby
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {WebpackLogger} logger
   * @param {CacheFacade} cache
   * @param {ObjectPattern & { context: string }} inputPattern
   * @param {number} index
   * @returns {Promise<Array<CopiedResult | undefined> | undefined>}
   */
  static async runPattern(globby, compiler, compilation, logger, cache, inputPattern, index) {
    const { RawSource } = compiler.webpack.sources;
    const pattern = { ...inputPattern };
    const originalFrom = pattern.from;
    const normalizedOriginalFrom = path.normalize(originalFrom);

    logger.log(`Processing pattern from '${normalizedOriginalFrom}' with context '${pattern.context}'`);
    
    let absoluteFrom = path.isAbsolute(normalizedOriginalFrom) 
      ? normalizedOriginalFrom 
      : path.resolve(pattern.context, normalizedOriginalFrom);

    logger.debug(`Getting stats for '${absoluteFrom}'`);
    
    const { inputFileSystem } = compiler;
    let stats;
    try {
      stats = await stat(inputFileSystem, absoluteFrom);
    } catch {}

    let fromType;
    if (stats) {
      fromType = stats.isDirectory() ? "dir" : stats.isFile() ? "file" : "glob";
      logger.debug(`Determined '${absoluteFrom}' is a ${fromType === "glob" ? "unknown type" : fromType}`);
    } else {
      fromType = "glob";
      logger.debug(`Determined '${absoluteFrom}' is a glob`);
    }

    const globOptions = {
      ...{
        followSymbolicLinks: true,
        cwd: pattern.context,
        objectMode: true
      },
      ...(pattern.globOptions || {}),
    };
    globOptions.fs = inputFileSystem;

    let glob;
    switch (fromType) {
      case "dir":
        compilation.contextDependencies.add(absoluteFrom);
        logger.debug(`Added '${absoluteFrom}' as a context dependency`);
        pattern.context = absoluteFrom;
        glob = path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom))), "**/*");
        absoluteFrom = path.join(absoluteFrom, "**/*");
        globOptions.dot = globOptions.dot ?? true;
        break;
      
      case "file":
        compilation.fileDependencies.add(absoluteFrom);
        logger.debug(`Added '${absoluteFrom}' as a file dependency`);
        pattern.context = path.dirname(absoluteFrom);
        glob = getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom)));
        globOptions.dot = globOptions.dot ?? true;
        break;
      
      case "glob":
      default:
        const contextDependencies = path.normalize(getGlobParent()(absoluteFrom));
        compilation.contextDependencies.add(contextDependencies);
        logger.debug(`Added '${contextDependencies}' as a context dependency`);
        glob = path.isAbsolute(originalFrom) 
          ? originalFrom 
          : path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(pattern.context))), originalFrom);
    }
    
    logger.log(`Globbing '${glob}'...`);

    let globEntries;
    try {
      globEntries = await globby(glob, globOptions);
    } catch (error) {
      compilation.errors.push(error);
      return;
    }

    if (globEntries.length === 0) {
      if (pattern.noErrorOnMissing) {
        logger.log(`Finished processing pattern from '${normalizedOriginalFrom}'`);
        return;
      }
      const missingError = new Error(`Unable to locate '${glob}' glob`);
      compilation.errors.push(missingError);
      return;
    }

    let copiedResult;
    try {
      copiedResult = await Promise.all(globEntries.map(async globEntry => {
        if (!globEntry.dirent.isFile()) return;
        if (pattern.filter && !(await pattern.filter(globEntry.path))) {
          logger.log(`Skipped '${globEntry.path}' due to filter`);
          return;
        }

        const from = globEntry.path;
        logger.debug(`Found '${from}'`);
        
        const absoluteFilename = path.resolve(pattern.context, from);
        const to = typeof pattern.to === "function" ? await pattern.to({ context: pattern.context, absoluteFilename }) : path.normalize(pattern.to || "");
        const toType = pattern.toType || (template.test(to) ? "template" : path.extname(to) === "" || to.endsWith(path.sep) ? "dir" : "file");
        logger.log(`'To' option '${to}' determined as '${toType}'`);

        const relativeFrom = path.relative(pattern.context, absoluteFilename);
        let filename = toType === "dir" ? path.join(to, relativeFrom) : to;
        filename = path.isAbsolute(filename) ? path.relative(compiler.options.output.path, filename) : filename;
        logger.log(`Resolved writing path for '${from}' to '${filename}'`);
        
        const sourceFilename = getNormalizePath()(path.relative(compiler.context, absoluteFilename));
        
        if (fromType === "dir" || fromType === "glob") {
          compilation.fileDependencies.add(absoluteFilename);
          logger.debug(`Added '${absoluteFilename}' as a file dependency`);
        }

        let cacheEntry;
        try {
          cacheEntry = await cache.getPromise(`${sourceFilename}|${index}`, null);
        } catch (error) {
          compilation.errors.push(error);
          return;
        }

        let source;
        if (cacheEntry) {
          let isValidSnapshot;
          try {
            isValidSnapshot = await CopyPlugin.checkSnapshotValid(compilation, cacheEntry.snapshot);
          } catch (error) {
            compilation.errors.push(error);
            return;
          }
          if (isValidSnapshot) source = cacheEntry.source;
        }

        if (!source) {
          const startTime = Date.now();
          let data;
          try {
            data = await readFile(inputFileSystem, absoluteFilename);
          } catch (error) {
            compilation.errors.push(error);
            return;
          }
          source = new RawSource(data);
          let snapshot;
          try {
            snapshot = await CopyPlugin.createSnapshot(compilation, startTime, absoluteFilename);
          } catch (error) {
            compilation.errors.push(error);
            return;
          }
          if (snapshot) {
            try {
              await cache.storePromise(`${sourceFilename}|${index}`, null, { source, snapshot });
            } catch (error) {
              compilation.errors.push(error);
              return;
            }
          }
        }
        
        if (pattern.transform) {
          const transformObj = typeof pattern.transform === "function" ? { transformer: pattern.transform } : pattern.transform;
          if (transformObj.transformer) {
            const buffer = source.buffer();
            if (transformObj.cache) {
              const hasher = compiler.webpack.util.createHash ? compiler.webpack.util.createHash("xxhash64") : require("crypto").createHash("md4");
              const defaultCacheKeys = {
                version,
                sourceFilename,
                transform: transformObj.transformer,
                contentHash: hasher.update(buffer).digest("hex"),
                index
              };
              const cacheKeys = `transform|${getSerializeJavascript()(typeof transformObj.cache === "boolean" ? defaultCacheKeys : typeof transformObj.cache.keys === "function" ? await transformObj.cache.keys(defaultCacheKeys, absoluteFilename) : { ...defaultCacheKeys, ...transformObj.cache.keys })}`;
              const cacheItem = cache.getItemCache(cacheKeys, cache.getLazyHashedEtag(source));
              source = await cacheItem.getPromise();
              if (!source) {
                const transformed = await transformObj.transformer(buffer, absoluteFilename);
                source = new RawSource(transformed);
                await cacheItem.storePromise(source);
              }
            } else {
              source = new RawSource(await transformObj.transformer(buffer, absoluteFilename));
            }
          }
        }
        
        let info = pattern.info || {};
        if (typeof pattern.info === "function") {
          info = pattern.info({ absoluteFilename, sourceFilename, filename, toType }) || {};
        }

        if (toType === "template") {
          const contentHash = CopyPlugin.getContentHash(compiler, compilation, source.buffer());
          const ext = path.extname(sourceFilename);
          const base = path.basename(sourceFilename);
          const name = base.slice(0, base.length - ext.length);

          const data = {
            filename: getNormalizePath()(path.relative(pattern.context, absoluteFilename)),
            contentHash,
            chunk: { name, id: sourceFilename, hash: contentHash }
          };
          const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(filename), data);
          info = { ...info, ...assetInfo };
          filename = interpolatedFilename;
        }

        return { sourceFilename, absoluteFilename, filename: getNormalizePath()(filename), source, info, force: pattern.force };
      }));
    } catch (error) {
      compilation.errors.push(error);
      return;
    }

    if (copiedResult.length === 0) {
      if (pattern.noErrorOnMissing) {
        logger.log(`Finished processing pattern from '${normalizedOriginalFrom}'`);
        return;
      }
      const missingError = new Error(`Unable to locate '${glob}' glob after filtering paths`);
      compilation.errors.push(missingError);
      return;
    }

    logger.log(`Finished processing pattern from '${normalizedOriginalFrom}'.`);
    return copiedResult;
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const logger = compilation.getLogger("copy-webpack-plugin");
      const cache = compilation.getCache("CopyWebpackPlugin");
      let globby;

      compilation.hooks.processAssets.tapAsync({
        name: "copy-webpack-plugin",
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
      }, async (unusedAssets, callback) => {
        if (!globby) {
          try {
            globby = await getGlobby();
          } catch (error) {
            callback(error);
            return;
          }
        }
        logger.log("Adding additional assets");

        const copiedResultMap = new Map();
        const scheduledTasks = [];

        this.patterns.forEach((item, index) => scheduledTasks.push(async () => {
          const normalizedPattern = typeof item === "string" ? { from: item } : { ...item };
          const context = normalizedPattern.context ?? compiler.context;
          normalizedPattern.context = path.isAbsolute(context) ? context : path.join(compiler.context, context);

          let copiedResult;
          try {
            copiedResult = await CopyPlugin.runPattern(globby, compiler, compilation, logger, cache, normalizedPattern, index);
          } catch (error) {
            compilation.errors.push(error);
            return;
          }
          if (!copiedResult) return;

          let filteredCopiedResult = copiedResult.filter(Boolean);

          if (normalizedPattern.transformAll !== undefined) {
            if (normalizedPattern.to === undefined) {
              compilation.errors.push(new Error(`Invalid "pattern.to" for "pattern.from": "${normalizedPattern.from}" with "pattern.transformAll" function. The "to" option must be specified.`));
              return;
            }

            filteredCopiedResult.sort((a, b) => a.absoluteFilename > b.absoluteFilename ? 1 : a.absoluteFilename < b.absoluteFilename ? -1 : 0);

            const mergedEtag = filteredCopiedResult.length === 1 
              ? cache.getLazyHashedEtag(filteredCopiedResult[0].source) 
              : filteredCopiedResult.reduce((accumulator, asset, i) => {
                return cache.mergeEtags(i === 1 ? cache.getLazyHashedEtag(accumulator.source) : accumulator, cache.getLazyHashedEtag(asset.source));
            });

            const cacheItem = cache.getItemCache(`transformAll|${getSerializeJavascript()({ version, from: normalizedPattern.from, to: normalizedPattern.to, transformAll: normalizedPattern.transformAll })}`, mergedEtag);

            let transformedAsset = await cacheItem.getPromise();
            if (!transformedAsset) {
              transformedAsset = { filename: normalizedPattern.to };
              try {
                transformedAsset.data = await normalizedPattern.transformAll(filteredCopiedResult.map(asset => ({
                  data: asset.source.buffer(),
                  sourceFilename: asset.sourceFilename,
                  absoluteFilename: asset.absoluteFilename,
                })));
              } catch (error) {
                compilation.errors.push(error);
                return;
              }
              
              const filename = typeof normalizedPattern.to === "function" ? await normalizedPattern.to({ context }) : normalizedPattern.to;
              if (template.test(filename)) {
                const contentHash = CopyPlugin.getContentHash(compiler, compilation, transformedAsset.data);
                const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(filename), {
                  contentHash,
                  chunk: { id: "unknown-copied-asset", hash: contentHash }
                });
                transformedAsset.filename = interpolatedFilename;
                transformedAsset.info = assetInfo;
              }
              const { RawSource } = compiler.webpack.sources;
              transformedAsset.source = new RawSource(transformedAsset.data);
              transformedAsset.force = normalizedPattern.force;
              await cacheItem.storePromise(transformedAsset);
            }
            filteredCopiedResult = [transformedAsset];
          }

          const priority = normalizedPattern.priority || 0;
          copiedResultMap.set(priority, (copiedResultMap.get(priority) || []).concat(filteredCopiedResult));
        }));

        await throttleAll(this.options.concurrency || 100, scheduledTasks);

        Array.from(copiedResultMap.entries())
          .sort((a, b) => a[0] - b[0])
          .reduce((acc, val) => acc.concat(val[1]), [])
          .forEach(result => {
            const { absoluteFilename, sourceFilename, filename, source, force } = result;
            const existingAsset = compilation.getAsset(filename);

            if (existingAsset) {
              if (force) {
                const info = { copied: true, sourceFilename };
                logger.log(`Force updating '${filename}' from '${absoluteFilename}'`);
                compilation.updateAsset(filename, source, { ...info, ...result.info });
                return;
              }
              logger.log(`Skipped '${filename}' from '${absoluteFilename}', already exists`);
              return;
            }

            const info = { copied: true, sourceFilename };
            logger.log(`Writing '${filename}' from '${absoluteFilename}'`);
            compilation.emitAsset(filename, source, { ...info, ...result.info });
          });

        logger.log("Finished adding additional assets");
        callback();
      });

      if (compilation.hooks.statsPrinter) {
        compilation.hooks.statsPrinter.tap(pluginName, stats => {
          stats.hooks.print.for("asset.info.copied").tap("copy-webpack-plugin", (copied, { green, formatFlag }) => 
            copied ? green(formatFlag("copied")) : ""
          );
        });
      }
    });
  }
}

module.exports = CopyPlugin;
