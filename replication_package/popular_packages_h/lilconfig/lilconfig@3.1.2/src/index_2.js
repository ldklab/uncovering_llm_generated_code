const path = require('path');
const fs = require('fs');
const os = require('os');

const { promises: fsPromises } = fs;

/** Generates default search places for configuration files */
function generateSearchPlaces(name, isSync) {
  return [
    'package.json',
    `.${name}rc.json`,
    `.${name}rc.js`,
    `.${name}rc.cjs`,
    ...(isSync ? [] : [`.${name}rc.mjs`]),
    `.config/${name}rc`,
    `.config/${name}rc.json`,
    `.config/${name}rc.js`,
    `.config/${name}rc.cjs`,
    ...(isSync ? [] : [`.config/${name}rc.mjs`]),
    `${name}.config.js`,
    `${name}.config.cjs`,
    ...(isSync ? [] : [`${name}.config.mjs`]),
  ];
}

/** Calculates the parent directory path */
function calculateParentDir(p) {
  return path.dirname(p) || path.sep;
}

/** JSON file loader */
const jsonLoader = (_, content) => JSON.parse(content);

// Conditional require function for different environments
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

/** Loaders for synchronous processing */
const syncLoaders = Object.freeze({
  '.js': requireFunc,
  '.json': requireFunc,
  '.cjs': requireFunc,
  noExt: jsonLoader,
});
module.exports.syncLoaders = syncLoaders;

/** Dynamic import loader */
async function dynamicImport(id) {
  try {
    const mod = await import(/* webpackIgnore: true */ id);
    return mod.default;
  } catch (e) {
    try {
      return requireFunc(id);
    } catch (requireE) {
      if (
        requireE.code === 'ERR_REQUIRE_ESM' ||
        (requireE instanceof SyntaxError &&
          requireE.message.includes('Cannot use import statement outside a module'))
      ) {
        throw e;
      }
      throw requireE;
    }
  }
}

/** Loaders for asynchronous processing */
const asyncLoaders = Object.freeze({
  '.js': dynamicImport,
  '.mjs': dynamicImport,
  '.cjs': dynamicImport,
  '.json': jsonLoader,
  noExt: jsonLoader,
});
module.exports.asyncLoaders = asyncLoaders;

/** Retrieves configuration options */
function retrieveOptions(name, options, isSync) {
  const configuration = {
    stopDir: os.homedir(),
    searchPlaces: generateSearchPlaces(name, isSync),
    ignoreEmptySearchPlaces: true,
    cache: true,
    transform: (result) => result,
    packageProp: [name],
    ...options,
    loaders: {
      ...(isSync ? syncLoaders : asyncLoaders),
      ...options.loaders,
    },
  };

  configuration.searchPlaces.forEach((place) => {
    const extension = path.extname(place) || 'noExt';
    const loader = configuration.loaders[extension];
    if (!loader) throw new Error(`Missing loader for extension "${place}"`);
    if (typeof loader !== 'function') throw new Error(`Loader is not a function for "${place}"`);
  });

  return configuration;
}

/** Retrieves a nested property from an object */
function fetchPackageProperty(props, obj) {
  if (typeof props === 'string') return obj[props] || null;
  return props.reduce((acc, prop) => (acc ? acc[prop] : null), obj) || null;
}

/** Validates the filepath */
function ensureValidFilePath(filepath) {
  if (!filepath) throw new Error('load must pass a non-empty string');
}

/** Validates a loader function */
function validateLoaderFunction(loader, ext) {
  if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
  if (typeof loader !== 'function') throw new Error('loader is not a function');
}

/** Factory function to handle caching */
const createCacheHandler = (enableCache) => (cache, path, result) => {
  if (enableCache) cache.set(path, result);
  return result;
};

/** Main lilconfig function to manage config loading */
function lilconfig(name, options) {
  const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache } =
    retrieveOptions(name, options ?? {}, false);
  const searchCache = new Map();
  const loadCache = new Map();
  const storeInCache = createCacheHandler(cache);

  return {
    async search(startDir = process.cwd()) {
      let result = { config: null, filepath: '' };
      const traversed = new Set();
      let currentDir = startDir;

      while (true) {
        if (cache && searchCache.has(currentDir)) {
          const cached = searchCache.get(currentDir);
          traversed.forEach((dir) => searchCache.set(dir, cached));
          return cached;
        if (cache) traversed.add(currentDir);

        for (const searchPlace of searchPlaces) {
          const candidatePath = path.join(currentDir, searchPlace);

          try {
            await fsPromises.access(candidatePath);
          } catch {
            continue;
          }

          const content = String(await fsPromises.readFile(candidatePath));
          const ext = path.extname(searchPlace) || 'noExt';
          const loader = loaders[ext];

          if (!loader || typeof loader !== 'function') continue;

          if (searchPlace === 'package.json') {
            const pkg = await loader(candidatePath, content);
            const config = fetchPackageProperty(packageProp, pkg);
            if (config !== null) {
              result = { config, filepath: candidatePath };
              break;
            }
          } else {
            if (content.trim() === '' && ignoreEmptySearchPlaces) continue;
            result = { config: await loader(candidatePath, content), filepath: candidatePath };
            break;
          }
        currentDir = calculateParentDir(currentDir);

        if (currentDir === stopDir || currentDir === calculateParentDir(currentDir)) break;
      }

      const transformedResult =
        result.filepath === '' && result.config === null ? transform(null) : transform(result);

      if (cache) traversed.forEach((dir) => searchCache.set(dir, transformedResult));

      return transformedResult;
    },

    async load(filepath) {
      ensureValidFilePath(filepath);
      const absolutePath = path.resolve(process.cwd(), filepath);

      if (cache && loadCache.has(absolutePath)) {
        return loadCache.get(absolutePath);
      }

      const { base, ext } = path.parse(absolutePath);
      const loader = loaders[ext || 'noExt'];
      validateLoaderFunction(loader, ext || 'noExt');

      const content = String(await fsPromises.readFile(absolutePath));
      const result = (base === 'package.json') 
                   ? { config: fetchPackageProperty(packageProp, await loader(absolutePath, content)), filepath: absolutePath }
                   : { config: content.trim() ? await loader(absolutePath, content) : undefined, filepath: absolutePath, isEmpty: !content.trim() };

      return storeInCache(loadCache, absolutePath, transform(result));
    },

    clearLoadCache() {
      if (cache) loadCache.clear();
    },
    clearSearchCache() {
      if (cache) searchCache.clear();
    },
    clearCaches() {
      if (cache) {
        loadCache.clear();
        searchCache.clear();
      }
    },
  };
}
module.exports.lilconfig = lilconfig;

/** Synchronous version of the lilconfig function */
function lilconfigSync(name, options) {
  const { ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache } = 
    retrieveOptions(name, options ?? {}, true);
  const searchCache = new Map();
  const loadCache = new Map();
  const storeInCache = createCacheHandler(cache);

  return {
    search(startDir = process.cwd()) {
      let result = { config: null, filepath: '' };
      const traversed = new Set();
      let currentDir = startDir;

      while (true) {
        if (cache && searchCache.has(currentDir)) {
          const cached = searchCache.get(currentDir);
          traversed.forEach((dir) => searchCache.set(dir, cached));
          return cached;
        if (cache) traversed.add(currentDir);

        for (const searchPlace of searchPlaces) {
          const candidatePath = path.join(currentDir, searchPlace);

          try {
            fs.accessSync(candidatePath);
          } catch {
            continue;
          }

          const content = String(fs.readFileSync(candidatePath));
          const ext = path.extname(searchPlace) || 'noExt';
          const loader = loaders[ext];

          if (!loader || typeof loader !== 'function') continue;

          if (searchPlace === 'package.json') {
            const pkg = loader(candidatePath, content);
            const config = fetchPackageProperty(packageProp, pkg);
            if (config !== null) {
              result = { config, filepath: candidatePath };
              break;
            }
          } else {
            if (content.trim() === '' && ignoreEmptySearchPlaces) continue;
            result = { config: loader(candidatePath, content), filepath: candidatePath };
            break;
          }
        }
        currentDir = calculateParentDir(currentDir);

        if (currentDir === stopDir || currentDir === calculateParentDir(currentDir)) break;
      }

      const transformedResult =
        result.filepath === '' && result.config === null ? transform(null) : transform(result);

      if (cache) traversed.forEach((dir) => searchCache.set(dir, transformedResult));

      return transformedResult;
    },

    load(filepath) {
      ensureValidFilePath(filepath);
      const absolutePath = path.resolve(process.cwd(), filepath);

      if (cache && loadCache.has(absolutePath)) {
        return loadCache.get(absolutePath);
      }

      const { base, ext } = path.parse(absolutePath);
      const loader = loaders[ext || 'noExt'];
      validateLoaderFunction(loader, ext || 'noExt');

      const content = String(fs.readFileSync(absolutePath));
      const result = (base === 'package.json') 
                   ? { config: fetchPackageProperty(packageProp, loader(absolutePath, content)), filepath: absolutePath }
                   : { config: content.trim() ? loader(absolutePath, content) : undefined, filepath: absolutePath, isEmpty: !content.trim() };

      return storeInCache(loadCache, absolutePath, transform(result));
    },

    clearLoadCache() {
      if (cache) loadCache.clear();
    },
    clearSearchCache() {
      if (cache) searchCache.clear();
    },
    clearCaches() {
      if (cache) {
        loadCache.clear();
        searchCache.clear();
      }
    },
  };
}
module.exports.lilconfigSync = lilconfigSync;

