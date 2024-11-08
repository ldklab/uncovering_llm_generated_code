"use strict";

const path = require("path");
const { validate } = require("schema-utils");
const { version } = require("../package.json");
const schema = require("./options.json");

const { readFile, stat, throttleAll, memoize } = require("./utils");
const getNormalizePath = memoize(() => require("normalize-path"));
const getGlobParent = memoize(() => require("glob-parent"));
const getSerializeJavascript = memoize(() => require("serialize-javascript"));
const getFastGlob = memoize(() => require("fast-glob"));
const getGlobby = memoize(async () => {
  const { globby } = await import("globby");
  return globby;
});

class CopyPlugin {
  constructor(options = { patterns: [] }) {
    validate(schema, options, { name: "Copy Plugin", baseDataPath: "options" });
    this.patterns = options.patterns;
    this.options = options.options || {};
  }

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

  static getContentHash(compiler, compilation, source) {
    const { hashDigest, hashDigestLength, hashFunction, hashSalt } = compilation.outputOptions;
    const hash = compiler.webpack.util.createHash(hashFunction);
    if (hashSalt) {
      hash.update(hashSalt);
    }
    hash.update(source);
    return hash.digest(hashDigest).toString().slice(0, hashDigestLength);
  }

  static async runPattern(globby, compiler, compilation, logger, cache, inputPattern, index) {
    const { RawSource } = compiler.webpack.sources;
    const pattern = { ...inputPattern };
    const context = pattern.context;
    const originalFrom = pattern.from;
    const normalizedOriginalFrom = path.normalize(originalFrom);
    logger.log(`Processing pattern from '${normalizedOriginalFrom}'`);
    
    let absoluteFrom = path.isAbsolute(normalizedOriginalFrom) ? normalizedOriginalFrom : path.resolve(context, normalizedOriginalFrom);
    
    let fromType;
    try {
      const stats = await stat(compiler.inputFileSystem, absoluteFrom);
      fromType = stats.isDirectory() ? "dir" : stats.isFile() ? "file" : "glob";
    } catch {
      fromType = "glob";
    }

    let glob;
    const globOptions = { ...pattern.globOptions, followSymbolicLinks: true, cwd: context, objectMode: true, fs: compiler.inputFileSystem };

    if (fromType === "dir") {
      compilation.contextDependencies.add(absoluteFrom);
      pattern.context = absoluteFrom;
      glob = path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom))), "**/*");
    } else if (fromType === "file") {
      compilation.fileDependencies.add(absoluteFrom);
      glob = getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom)));
    } else {
      const contextDep = path.normalize(getGlobParent()(absoluteFrom));
      compilation.contextDependencies.add(contextDep);
      glob = path.isAbsolute(originalFrom) ? originalFrom : path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(context))), originalFrom);
    }
    
    logger.log(`Globbing '${glob}'...`);
    
    try {
      const globEntries = await globby(glob, globOptions);
      if (globEntries.length === 0) throw new Error(`No files matching '${glob}'`);

      const results = await Promise.all(globEntries.map(async globEntry => {
        if (!globEntry.dirent.isFile()) return;

        if (pattern.filter && !(await pattern.filter(globEntry.path))) {
          logger.log(`Filtered '${globEntry.path}'`);
          return;
        }

        const absoluteFilename = path.resolve(pattern.context, globEntry.path);
        const to = typeof pattern.to === "function" ? await pattern.to({ context: pattern.context, absoluteFilename }) : path.normalize(pattern.to || "");
        const toType = pattern.toType ? pattern.toType : path.extname(to) === "" || to.endsWith(path.sep) ? "dir" : "file";
        logger.log(`To path determined as '${to}', type: '${toType}'`);
        
        let filename = toType === "dir" ? path.join(to, path.relative(pattern.context, absoluteFilename)) : to;
        filename = path.isAbsolute(filename) ? path.relative(compiler.options.output.path, filename) : filename;

        compilation.fileDependencies.add(absoluteFilename);
        
        let source;
        const cacheKey = `${getNormalizePath()(path.relative(compiler.context, absoluteFilename))}|${index}`;
        const cacheEntry = await cache.getPromise(cacheKey, null);

        if (cacheEntry && await CopyPlugin.checkSnapshotValid(compilation, cacheEntry.snapshot)) {
          logger.log(`Cache hit for '${absoluteFilename}'`);
          source = cacheEntry.source;
        } else {
          logger.log(`Cache miss for '${absoluteFilename}', reading...`);
          const data = await readFile(compiler.inputFileSystem, absoluteFilename);
          source = new RawSource(data);
          const snapshot = await CopyPlugin.createSnapshot(compilation, Date.now(), absoluteFilename);
          await cache.storePromise(cacheKey, null, { source, snapshot });
          logger.log(`Read and cached '${absoluteFilename}'`);
        }

        if (pattern.transform) {
          const transformFunction = typeof pattern.transform === "function" ? pattern.transform : pattern.transform.transformer;
          logger.log(`Transforming content for '${absoluteFilename}'...`);
          const transformedData = await transformFunction(source.buffer(), absoluteFilename);
          source = new RawSource(transformedData);
        }

        if (toType === "template") {
          const contentHash = CopyPlugin.getContentHash(compiler, compilation, source.buffer());
          logger.log(`Interpolating template '${filename}'...`);
          filename = compilation.getPath(filename, { filename: path.relative(pattern.context, absoluteFilename), contentHash });
        }

        return {
          sourceFilename: getNormalizePath()(path.relative(compiler.context, absoluteFilename)),
          absoluteFilename,
          filename: getNormalizePath()(filename),
          source,
          force: pattern.force,
          info: pattern.info || {}
        };
      }));

      return results.filter(Boolean);
    } catch (error) {
      compilation.errors.push(error);
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("CopyPlugin", compilation => {
      const logger = compilation.getLogger("copy-webpack-plugin");
      const cache = compilation.getCache("CopyWebpackPlugin");
      let globby;

      compilation.hooks.processAssets.tapAsync({
        name: "copy-webpack-plugin",
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
      }, async (assets, callback) => {
        try {
          if (!globby) globby = await getGlobby();
          
          logger.log("Adding assets...");
          const tasks = this.patterns.map((pattern, index) => async () => {
            const normalizedPattern = typeof pattern === "string" ? { from: pattern } : { ...pattern };
            normalizedPattern.context = normalizedPattern.context || compiler.context;
            const results = await CopyPlugin.runPattern(globby, compiler, compilation, logger, cache, normalizedPattern, index);
            if (results) results.forEach(result => {
              if (!result) return;
              const existingAsset = compilation.getAsset(result.filename);
              if (existingAsset && !result.force) {
                logger.log(`Skipping '${result.filename}', already exists.`);
                return;
              }
              const info = { copied: true, ...result.info };
              const action = existingAsset ? 'Updating' : 'Adding';
              logger.log(`${action} '${result.filename}'...`);
              existingAsset ? compilation.updateAsset(result.filename, result.source, info) : compilation.emitAsset(result.filename, result.source, info);
            });
          });

          await throttleAll(this.options.concurrency || 100, tasks);
          callback();
        } catch (error) {
          callback(error);
        }
      });
    });
  }
}

module.exports = CopyPlugin;
