"use strict";

const path = require("path");
const { validate } = require("schema-utils");
const { version } = require("../package.json");
const schema = require("./options.json");
const { readFile, stat, throttleAll, memoize } = require("./utils");
const template = /\[\\*([\w:]+)\\*\]/i;

// Lazy-load dependencies
const getNormalizePath = memoize(() => require("normalize-path"));
const getGlobParent = memoize(() => require("glob-parent"));
const getSerializeJavascript = memoize(() => require("serialize-javascript"));
const getFastGlob = memoize(() => require("fast-glob"));
const getGlobby = memoize(async () => (await import("globby")).globby);

class CopyPlugin {
  constructor(options = { patterns: [] }) {
    validate(schema, options, { name: "Copy Plugin", baseDataPath: "options" });
    this.patterns = options.patterns;
    this.options = options.options || {};
  }

  static async createSnapshot(compilation, startTime, dependency) {
    return new Promise((resolve, reject) => {
      compilation.fileSystemInfo.createSnapshot(
        startTime, [dependency], undefined, undefined, null, 
        (error, snapshot) => error ? reject(error) : resolve(snapshot)
      );
    });
  }

  static async checkSnapshotValid(compilation, snapshot) {
    return new Promise((resolve, reject) => {
      compilation.fileSystemInfo.checkSnapshotValid(snapshot, (error, isValid) =>
        error ? reject(error) : resolve(isValid)
      );
    });
  }

  static getContentHash(compiler, compilation, source) {
    const { hashDigest, hashDigestLength, hashFunction, hashSalt } = compilation.outputOptions;
    const hash = compiler.webpack.util.createHash(hashFunction);
    if (hashSalt) hash.update(hashSalt);
    hash.update(source);
    return hash.digest(hashDigest).toString().slice(0, hashDigestLength);
  }

  static async runPattern(globby, compiler, compilation, logger, cache, inputPattern, index) {
    const { RawSource } = compiler.webpack.sources;
    const pattern = { ...inputPattern };
    const normalizedOriginalFrom = path.normalize(pattern.from);
    
    logger.log(`Processing pattern from '${normalizedOriginalFrom}' with context '${pattern.context}'`);
    
    let absoluteFrom;
    if (path.isAbsolute(normalizedOriginalFrom)) {
      absoluteFrom = normalizedOriginalFrom;
    } else {
      absoluteFrom = path.resolve(pattern.context, normalizedOriginalFrom);
    }
    
    logger.debug(`Getting stats for '${absoluteFrom}'...`);
    const { inputFileSystem } = compiler;
    let stats;
    try {
      stats = await stat(inputFileSystem, absoluteFrom);
    } catch (error) {
      // Handle error
    }

    let fromType;
    if (stats) {
      if (stats.isDirectory()) {
        fromType = "dir";
        logger.debug(`'${absoluteFrom}' is a directory`);
      } else if (stats.isFile()) {
        fromType = "file";
        logger.debug(`'${absoluteFrom}' is a file`);
      } else {
        fromType = "glob";
        logger.debug(`'${absoluteFrom}' is unknown`);
      }
    } else {
      fromType = "glob";
      logger.debug(`'${absoluteFrom}' is a glob`);
    }

    const globOptions = {
      followSymbolicLinks: true,
      objectMode: true,
      cwd: pattern.context,
      ...(pattern.globOptions || {}),
    };
    globOptions.fs = inputFileSystem;

    let glob;
    switch (fromType) {
      case "dir":
        compilation.contextDependencies.add(absoluteFrom);
        logger.debug(`Added '${absoluteFrom}' as context dependency`);
        pattern.context = absoluteFrom;
        glob = path.posix.join(getFastGlob().escapePath(getNormalizePath()(absoluteFrom)), "**/*");
        if (globOptions.dot === undefined) globOptions.dot = true;
        break;
      case "file":
        compilation.fileDependencies.add(absoluteFrom);
        logger.debug(`Added '${absoluteFrom}' as file dependency`);
        pattern.context = path.dirname(absoluteFrom);
        glob = getFastGlob().escapePath(getNormalizePath()(absoluteFrom));
        if (globOptions.dot === undefined) globOptions.dot = true;
        break;
      default:
        const contextDependencies = path.normalize(getGlobParent()(absoluteFrom));
        compilation.contextDependencies.add(contextDependencies);
        logger.debug(`Added '${contextDependencies}' as context dependency`);
        glob = path.isAbsolute(pattern.from) ? pattern.from : path.posix.join(getFastGlob().escapePath(getNormalizePath()(pattern.context)), pattern.from);
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
      if (!pattern.noErrorOnMissing) {
        const missingError = new Error(`Unable to locate '${glob}' glob`);
        compilation.errors.push(missingError);
      }
      return;
    }

    let copiedResult;
    try {
      copiedResult = await Promise.all(
        globEntries.map(async globEntry => {
          if (!globEntry.dirent.isFile()) return;

          if (pattern.filter) {
            if (!(await pattern.filter(globEntry.path))) {
              logger.log(`Skipping '${globEntry.path}' (filtered)`);
              return;
            }
          }

          const from = globEntry.path;
          const absoluteFilename = path.resolve(pattern.context, from);
          const to = typeof pattern.to === "function" ? await pattern.to({ context: pattern.context, absoluteFilename }) : path.normalize(pattern.to || "");
          const toType = pattern.toType || (template.test(to) ? "template" : path.extname(to) === "" || to.endsWith(path.sep) ? "dir" : "file");
          const relativeFrom = path.relative(pattern.context, absoluteFilename);
          let filename = toType === "dir" ? path.join(to, relativeFrom) : to;

          if (path.isAbsolute(filename)) {
            filename = path.relative(compiler.options.output.path, filename);
          }

          const sourceFilename = getNormalizePath()(path.relative(compiler.context, absoluteFilename));

          if (fromType === "dir" || fromType === "glob") {
            compilation.fileDependencies.add(absoluteFilename);
            logger.debug(`Added '${absoluteFilename}' as file dependency`);
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
            if (await CopyPlugin.checkSnapshotValid(compilation, cacheEntry.snapshot)) {
              source = cacheEntry.source;
            }
          }

          if (!source) {
            let data;
            try {
              data = await readFile(inputFileSystem, absoluteFilename);
            } catch (error) {
              compilation.errors.push(error);
              return;
            }

            source = new RawSource(data);
            try {
              const snapshot = await CopyPlugin.createSnapshot(compilation, Date.now(), absoluteFilename);
              await cache.storePromise(`${sourceFilename}|${index}`, null, { source, snapshot });
            } catch (error) {
              compilation.errors.push(error);
              return;
            }
          }

          if (pattern.transform) {
            const transformObj = typeof pattern.transform === "function" ? { transformer: pattern.transform } : pattern.transform;
            if (transformObj.transformer) {
              const buffer = source.buffer();
              if (transformObj.cache) {
                const hasher = compiler.webpack.util.createHash("xxhash64");
                const defaultCacheKeys = {
                  version,
                  sourceFilename,
                  transform: transformObj.transformer,
                  contentHash: hasher.update(buffer).digest("hex"),
                  index
                };
                const cacheKeys = `transform|${getSerializeJavascript()(typeof transformObj.cache === "boolean" ? defaultCacheKeys : typeof transformObj.cache.keys === "function" ? await transformObj.cache.keys(defaultCacheKeys, absoluteFilename) : { ...defaultCacheKeys, ...transformObj.cache.keys })}`;
                const cacheItem = cache.getItemCache(cacheKeys, cache.getLazyHashedEtag(source));
                source = await cacheItem.getPromise() || new RawSource(await transformObj.transformer(buffer, absoluteFilename));
                if (!source) await cacheItem.storePromise(source);
              } else {
                source = new RawSource(await transformObj.transformer(buffer, absoluteFilename));
              }
            }
          }

          let info = typeof pattern.info === "function" ? pattern.info({ absoluteFilename, sourceFilename, filename, toType }) : pattern.info || {};

          if (toType === "template") {
            const contentHash = CopyPlugin.getContentHash(compiler, compilation, source.buffer());
            const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(filename), {
              contentHash,
              chunk: { id: "unknown-copied-asset", hash: contentHash }
            });
            info = { ...info, ...assetInfo };
            filename = interpolatedFilename;
          } else {
            filename = getNormalizePath()(filename);
          }

          return { sourceFilename, absoluteFilename, filename, source, info, force: pattern.force };
        })
      );
    } catch (error) {
      compilation.errors.push(error);
      return;
    }

    if (copiedResult.length === 0 && !pattern.noErrorOnMissing) {
      compilation.errors.push(new Error(`Unable to locate '${glob}' glob after filtering paths`));
      return;
    }

    logger.log(`Finished processing pattern from '${normalizedOriginalFrom}' with context '${pattern.context}'`);
    return copiedResult;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const logger = compilation.getLogger(pluginName);
      const cache = compilation.getCache(pluginName);
      let globby;

      compilation.hooks.processAssets.tapAsync({ name: pluginName, stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, async (assets, callback) => {
        if (!globby) {
          try {
            globby = await getGlobby();
          } catch (error) {
            callback(error);
            return;
          }
        }

        logger.log("Adding additional assets...");
        const copiedResultMap = new Map();
        const tasks = this.patterns.map((pattern, index) => async () => {
          const normalizedPattern = typeof pattern === "string" ? { from: pattern } : { ...pattern };
          normalizedPattern.context = normalizedPattern.context ? path.resolve(compiler.context, normalizedPattern.context) : compiler.context;

          const copiedResult = await CopyPlugin.runPattern(globby, compiler, compilation, logger, cache, normalizedPattern, index);
          if (!copiedResult) return;

          const filteredCopiedResult = copiedResult.filter(Boolean);
          if (typeof normalizedPattern.transformAll !== "undefined") {
            filteredCopiedResult.sort((a, b) => a.absoluteFilename.localeCompare(b.absoluteFilename));
            const mergedEtag = filteredCopiedResult.reduce((etag, asset, i) => cache.mergeEtags(i === 1 ? cache.getLazyHashedEtag(etag.source) : etag, cache.getLazyHashedEtag(asset.source)));
            const cacheItem = cache.getItemCache(`transformAll|${getSerializeJavascript()({ version, from: normalizedPattern.from, to: normalizedPattern.to, transformAll: normalizedPattern.transformAll })}`, mergedEtag);
            let transformedAsset = await cacheItem.getPromise();
            if (!transformedAsset) {
              transformedAsset = {
                filename: normalizedPattern.to,
                data: await normalizedPattern.transformAll(filteredCopiedResult.map(asset => ({ data: asset.source.buffer(), sourceFilename: asset.sourceFilename, absoluteFilename: asset.absoluteFilename })))
              };
              transformedAsset.filename = await (typeof normalizedPattern.to === "function" ? normalizedPattern.to({ context: normalizedPattern.context }) : normalizedPattern.to);
              const contentHash = CopyPlugin.getContentHash(compiler, compilation, transformedAsset.data);
              const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(transformedAsset.filename), {
                contentHash,
                chunk: { id: "unknown", hash: contentHash }
              });
              transformedAsset.filename = interpolatedFilename;
              transformedAsset.info = assetInfo;
              transformedAsset.source = new RawSource(transformedAsset.data);
              transformedAsset.force = normalizedPattern.force;
              await cacheItem.storePromise(transformedAsset);
            }
            filteredCopiedResult.splice(0, filteredCopiedResult.length, transformedAsset);
          }

          const priority = normalizedPattern.priority || 0;
          if (!copiedResultMap.has(priority)) {
            copiedResultMap.set(priority, []);
          }
          copiedResultMap.get(priority).push(...filteredCopiedResult);
        });

        await throttleAll(this.options.concurrency || 100, tasks);
        
        const copiedResult = [...copiedResultMap.entries()].sort((a, b) => a[0] - b[0]);

        copiedResult.flatMap(([_, results]) => results).filter(Boolean).forEach(result => {
          const { absoluteFilename, sourceFilename, filename, source, force } = result;
          const existingAsset = compilation.getAsset(filename);
          if (existingAsset && !force) {
            logger.log(`Skipping '${filename}' from '${absoluteFilename}' (already exists)`);
            return;
          }

          if (existingAsset && force) {
            logger.log(`Updating '${filename}' from '${absoluteFilename}' (force)`);
            compilation.updateAsset(filename, source, { copied: true, sourceFilename, ...result.info });
          } else {
            logger.log(`Emitting '${filename}' from '${absoluteFilename}'`);
            compilation.emitAsset(filename, source, { copied: true, sourceFilename, ...result.info });
          }
        });

        logger.log("Finished adding assets");
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
