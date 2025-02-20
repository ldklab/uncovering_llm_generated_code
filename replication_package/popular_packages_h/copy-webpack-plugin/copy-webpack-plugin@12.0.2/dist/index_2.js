"use strict";

const path = require('path');
const { validate } = require('schema-utils');
const { version } = require('../package.json');
const schema = require('./options.json');
const { readFile, stat, throttleAll, memoize } = require('./utils');

const template = /\[\\*([\w:]+)\\*\]/i;

const getNormalizePath = memoize(() => require('normalize-path'));
const getGlobParent = memoize(() => require('glob-parent'));
const getSerializeJavascript = memoize(() => require('serialize-javascript'));
const getFastGlob = memoize(() => require('fast-glob'));
const getGlobby = memoize(async () => {
  const { globby } = await import('globby');
  return globby;
});

class CopyPlugin {
  constructor(options = { patterns: [] }) {
    validate(schema, options, {
      name: 'Copy Plugin',
      baseDataPath: 'options'
    });

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
    const { outputOptions } = compilation;
    const { hashDigest, hashDigestLength, hashFunction, hashSalt } = outputOptions;
    const hash = compiler.webpack.util.createHash(hashFunction);

    if (hashSalt) {
      hash.update(hashSalt);
    }

    hash.update(source);
    const fullContentHash = hash.digest(hashDigest);
    
    return fullContentHash.toString().slice(0, hashDigestLength);
  }

  static async runPattern(globby, compiler, compilation, logger, cache, inputPattern, index) {
    const { RawSource } = compiler.webpack.sources;
    const pattern = { ...inputPattern };
    const originalFrom = pattern.from;
    const normalizedOriginalFrom = path.normalize(originalFrom);
    
    logger.log(`processing pattern from '${normalizedOriginalFrom}' with context '${pattern.context}'`);
    
    let absoluteFrom;
    const inputFileSystem = compiler.inputFileSystem;

    if (path.isAbsolute(normalizedOriginalFrom)) {
      absoluteFrom = normalizedOriginalFrom;
    } else {
      absoluteFrom = path.resolve(pattern.context, normalizedOriginalFrom);
    }

    let stats;
    try {
      stats = await stat(inputFileSystem, absoluteFrom);
    } catch (error) {
      // Handle error silently
    }

    let fromType = stats ? (stats.isDirectory() ? 'dir' : 'file') : 'glob';

    const globOptions = {
      followSymbolicLinks: true,
      ...(pattern.globOptions || {}),
      cwd: pattern.context,
      objectMode: true,
      fs: inputFileSystem
    };

    let glob;
    switch (fromType) {
      case 'dir':
        compilation.contextDependencies.add(absoluteFrom);
        pattern.context = absoluteFrom;
        glob = path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom))), '**/*');
        absoluteFrom = path.join(absoluteFrom, '**/*');
        if (typeof globOptions.dot === 'undefined') {
          globOptions.dot = true;
        }
        break;
      case 'file':
        compilation.fileDependencies.add(absoluteFrom);
        pattern.context = path.dirname(absoluteFrom);
        glob = getFastGlob().escapePath(getNormalizePath()(path.resolve(absoluteFrom)));
        if (typeof globOptions.dot === 'undefined') {
          globOptions.dot = true;
        }
        break;
      case 'glob':
      default:
        {
          const contextDependencies = path.normalize(getGlobParent()(absoluteFrom));
          compilation.contextDependencies.add(contextDependencies);
          glob = path.isAbsolute(originalFrom)
            ? originalFrom
            : path.posix.join(getFastGlob().escapePath(getNormalizePath()(path.resolve(pattern.context))), originalFrom);
        }
    }

    let globEntries;
    try {
      globEntries = await globby(glob, globOptions);
    } catch (error) {
      compilation.errors.push(error);
      return;
    }

    if (globEntries.length === 0) {
      if (pattern.noErrorOnMissing) {
        logger.log(`processed pattern from '${normalizedOriginalFrom}' with context '${pattern.context}' to '${pattern.to}'`);
        return;
      }
      const missingError = new Error(`unable to locate '${glob}' glob`);
      compilation.errors.push(missingError);
      return;
    }

    let copiedResult;
    try {
      copiedResult = await Promise.all(
        globEntries.map(async (globEntry) => {
          if (!globEntry.dirent.isFile()) return;

          if (pattern.filter) {
            let isFiltered;
            try {
              isFiltered = await pattern.filter(globEntry.path);
            } catch (error) {
              compilation.errors.push(error);
              return;
            }
            if (!isFiltered) {
              logger.log(`skipping '${globEntry.path}', filtered`);
              return;
            }
          }

          const from = globEntry.path;
          const absoluteFilename = path.resolve(pattern.context, from);
          const to = typeof pattern.to === 'function' ? await pattern.to({ context: pattern.context, absoluteFilename }) : path.normalize(pattern.to || '');
          const toType = pattern.toType || (template.test(to) ? 'template' : path.extname(to) === '' ? 'dir' : 'file');
          const relativeFrom = path.relative(pattern.context, absoluteFilename);
          let filename = toType === 'dir' ? path.join(to, relativeFrom) : to;

          if (path.isAbsolute(filename)) {
            filename = path.relative(compiler.options.output.path, filename);
          }

          const sourceFilename = getNormalizePath()(path.relative(compiler.context, absoluteFilename));

          if (fromType === 'dir' || fromType === 'glob') {
            compilation.fileDependencies.add(absoluteFilename);
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
            if (isValidSnapshot) {
              ({ source } = cacheEntry);
            }
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
            const transformObj = typeof pattern.transform === 'function' ? { transformer: pattern.transform } : pattern.transform;
            if (transformObj.transformer) {
              const buffer = source.buffer();

              if (transformObj.cache) {
                const hasher = compiler.webpack.util.createHash ? compiler.webpack.util.createHash('xxhash64') : require('crypto').createHash('md4');
                const defaultCacheKeys = { version, sourceFilename, transform: transformObj.transformer, contentHash: hasher.update(buffer).digest('hex'), index };
                const cacheKeys = `transform|${getSerializeJavascript()(typeof transformObj.cache === 'boolean' ? defaultCacheKeys : transformObj.cache.keys ? await transformObj.cache.keys(defaultCacheKeys, absoluteFilename) : { ...defaultCacheKeys, ...transformObj.cache.keys })}`;
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

          let info = typeof pattern.info === 'undefined' ? {} : typeof pattern.info === 'function' ? pattern.info({ absoluteFilename, sourceFilename, filename, toType }) || {} : pattern.info || {};
          if (toType === 'template') {
            const contentHash = CopyPlugin.getContentHash(compiler, compilation, source.buffer());
            const ext = path.extname(sourceFilename);
            const base = path.basename(sourceFilename);
            const name = base.slice(0, base.length - ext.length);
            const data = { filename: getNormalizePath()(path.relative(pattern.context, absoluteFilename)), contentHash, chunk: { name, id: sourceFilename, hash: contentHash } };
            const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(filename), data);
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

    if (copiedResult.length === 0) {
      if (pattern.noErrorOnMissing) {
        logger.log(`processed pattern from '${normalizedOriginalFrom}' with context '${pattern.context}' to '${pattern.to}'`);
        return;
      }
      const missingError = new Error(`unable to locate '${glob}' glob after filtering`);
      compilation.errors.push(missingError);
      return;
    }

    logger.log(`processed pattern from '${normalizedOriginalFrom}' with context '${pattern.context}'`);
    return copiedResult;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const logger = compilation.getLogger('copy-webpack-plugin');
      const cache = compilation.getCache('CopyWebpackPlugin');
      let globby;

      compilation.hooks.processAssets.tapAsync({ name: 'copy-webpack-plugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, async (unusedAssets, callback) => {
        if (!globby) {
          try {
            globby = await getGlobby();
          } catch (error) {
            callback(error);
            return;
          }
        }

        logger.log('adding additional assets...');
        const copiedResultMap = new Map();

        const scheduledTasks = this.patterns.map((item, index) =>
          async () => {
            const normalizedPattern = typeof item === 'string' ? { from: item } : { ...item };
            const context = !normalizedPattern.context ? compiler.context : path.isAbsolute(normalizedPattern.context) ? normalizedPattern.context : path.join(compiler.context, normalizedPattern.context);
            normalizedPattern.context = context;

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
              if (!normalizedPattern.to) {
                compilation.errors.push(new Error(`Invalid "pattern.to" for "pattern.from": "${normalizedPattern.from}" with "pattern.transformAll". The "to" option must be specified.`));
                return;
              }

              filteredCopiedResult.sort((a, b) => (a.absoluteFilename > b.absoluteFilename ? 1 : a.absoluteFilename < b.absoluteFilename ? -1 : 0));

              const mergedEtag = filteredCopiedResult.length === 1 ? cache.getLazyHashedEtag(filteredCopiedResult[0].source) : filteredCopiedResult.reduce((accumulator, asset, i) => cache.mergeEtags(i === 1 ? cache.getLazyHashedEtag(accumulator.source) : accumulator, cache.getLazyHashedEtag(asset.source)));

              const cacheItem = cache.getItemCache(`transformAll|${getSerializeJavascript()({ version, from: normalizedPattern.from, to: normalizedPattern.to, transformAll: normalizedPattern.transformAll })}`, mergedEtag);

              let transformedAsset = await cacheItem.getPromise();
              if (!transformedAsset) {
                transformedAsset = { filename: normalizedPattern.to };
                try {
                  transformedAsset.data = await normalizedPattern.transformAll(filteredCopiedResult.map((asset) => ({ data: asset.source.buffer(), sourceFilename: asset.sourceFilename, absoluteFilename: asset.absoluteFilename })));
                } catch (error) {
                  compilation.errors.push(error);
                  return;
                }

                const filename = typeof normalizedPattern.to === 'function' ? await normalizedPattern.to({ context }) : normalizedPattern.to;
                if (template.test(filename)) {
                  const contentHash = CopyPlugin.getContentHash(compiler, compilation, transformedAsset.data);
                  const { path: interpolatedFilename, info: assetInfo } = compilation.getPathWithInfo(getNormalizePath()(filename), { contentHash, chunk: { id: 'unknown-copied-asset', hash: contentHash } });
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
            if (!copiedResultMap.has(priority)) {
              copiedResultMap.set(priority, []);
            }

            copiedResultMap.get(priority).push(...filteredCopiedResult);
          });

        await throttleAll(this.options.concurrency || 100, scheduledTasks);

        const copiedResult = [...copiedResultMap.entries()].sort((a, b) => a[0] - b[0]);

        copiedResult.reduce((acc, val) => acc.concat(val[1]), []).filter(Boolean).forEach((result) => {
          const { absoluteFilename, sourceFilename, filename, source, force } = result;
          const existingAsset = compilation.getAsset(filename);

          if (existingAsset) {
            if (force) {
              const info = { copied: true, sourceFilename };
              logger.log(`force updating '${filename}' from '${absoluteFilename}' to assets`);
              compilation.updateAsset(filename, source, { ...info, ...result.info });
              logger.log(`force updated '${filename}' from '${absoluteFilename}' to assets`);
              return;
            }

            logger.log(`skipping '${filename}' from '${absoluteFilename}', already exists`);
            return;
          }

          const info = { copied: true, sourceFilename };
          logger.log(`writing '${filename}' from '${absoluteFilename}' to assets`);
          compilation.emitAsset(filename, source, { ...info, ...result.info });
          logger.log(`written '${filename}' from '${absoluteFilename}' to assets`);
        });

        logger.log('finished adding additional assets');
        callback();
      });

      if (compilation.hooks.statsPrinter) {
        compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
          stats.hooks.print.for('asset.info.copied').tap('copy-webpack-plugin', (copied, { green, formatFlag }) => (copied ? green(formatFlag('copied')) : ''));
        });
      }
    });
  }
}

module.exports = CopyPlugin;
