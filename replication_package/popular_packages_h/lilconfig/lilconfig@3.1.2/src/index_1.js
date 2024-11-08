const path = require('path');
const fs = require('fs');
const os = require('os');

const fsPromises = fs.promises;
const defaultSyncLoaders = Object.freeze({
  '.js': require,
  '.json': require,
  '.cjs': require,
  noExt: (_, content) => JSON.parse(content),
});
const defaultLoaders = Object.freeze({
  '.js': dynamicImport,
  '.mjs': dynamicImport,
  '.cjs': dynamicImport,
  '.json': (_, content) => JSON.parse(content),
  noExt: (_, content) => JSON.parse(content),
});

/**
 * Generate default search locations based on file name and sync flag
 * @param {string} name
 * @param {boolean} sync
 * @returns {string[]}
 */
function generateSearchPlaces(name, sync) {
  return [
    'package.json',
    `.${name}rc.json`,
    `.${name}rc.js`,
    `.${name}rc.cjs`,
    ...(sync ? [] : [`.${name}rc.mjs`]),
    `.config/${name}rc`,
    `.config/${name}rc.json`,
    `.config/${name}rc.js`,
    `.config/${name}rc.cjs`,
    ...(sync ? [] : [`.config/${name}rc.mjs`]),
    `${name}.config.js`,
    `${name}.config.cjs`,
    ...(sync ? [] : [`${name}.config.mjs`]),
  ];
}

/**
 * Get parent directory path
 * @param {string} p
 * @returns {string}
 */
function getParentDirectory(p) {
  return path.dirname(p) || path.sep;
}

/**
 * Validate file path
 * @param {string} filepath
 */
function checkFilePath(filepath) {
  if (!filepath) throw new Error('load must pass a non-empty string');
}

/**
 * Validate loader function
 * @param {Function} loader
 * @param {string} ext
 */
function checkLoader(loader, ext) {
  if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
  if (typeof loader !== 'function') throw new Error('loader is not a function');
}

/**
 * Create emplace function for caching
 * @param {boolean} enableCache
 * @returns {(c: Map, filepath: string, res: any) => any}
 */
const createEmplaceFunction = (enableCache) => (cache, filepath, result) => {
  if (enableCache) cache.set(filepath, result);
  return result;
};

/**
 * Asynchronously import a module, with fallback to require
 * @param {string} id
 * @returns {Promise<any>}
 */
async function dynamicImport(id) {
  try {
    const module = await import(/* webpackIgnore: true */ id);
    return module.default;
  } catch (e) {
    try {
      return require(id);
    } catch (requireError) {
      if (
        requireError.code === 'ERR_REQUIRE_ESM' ||
        (requireError instanceof SyntaxError &&
          requireError.message.includes('Cannot use import statement outside a module'))
      ) {
        throw e;
      }
      throw requireError;
    }
  }
}

/**
 * Retrieve options merged with defaults
 * @param {string} name
 * @param {object} options
 * @param {boolean} sync
 * @returns {object}
 */
function configureOptions(name, options, sync) {
  return {
    stopDir: os.homedir(),
    searchPlaces: generateSearchPlaces(name, sync),
    ignoreEmptySearchPlaces: true,
    cache: true,
    transform: (x) => x,
    packageProp: [name],
    ...options,
    loaders: {
      ...(sync ? defaultSyncLoaders : defaultLoaders),
      ...options.loaders,
    },
  };
}

/**
 * Retrieve property from package.json object
 * @param {string|string[]} props
 * @param {object} obj
 * @returns {any}
 */
function retrievePackageProperty(props, obj) {
  const propertyPath = typeof props === 'string' ? [props] : props;
  return propertyPath.reduce((acc, prop) => (acc === undefined ? acc : acc[prop]), obj) || null;
}

module.exports.lilconfig = function lilconfig(name, options) {
  const {ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache} = configureOptions(name, options ?? {}, false);
  const searchCache = new Map();
  const loadCache = new Map();
  const emplace = createEmplaceFunction(cache);

  return {
    async search(searchFrom = process.cwd()) {
      const result = { config: null, filepath: '' };
      const visitedDirs = new Set();
      let currentDir = searchFrom;

      dirLoop: while (true) {
        if (cache) {
          const cachedResult = searchCache.get(currentDir);
          if (cachedResult !== undefined) {
            visitedDirs.forEach((dir) => searchCache.set(dir, cachedResult));
            return cachedResult;
          }
          visitedDirs.add(currentDir);
        }

        for (const searchPlace of searchPlaces) {
          const filepath = path.resolve(currentDir, searchPlace);
          try {
            await fsPromises.access(filepath);
          } catch {
            continue;
          }

          const content = (await fsPromises.readFile(filepath)).toString();
          const loaderKey = path.extname(searchPlace) || 'noExt';
          const loader = loaders[loaderKey];

          if (searchPlace === 'package.json') {
            const pkgConfig = await loader(filepath, content);
            const potentiallyFoundConfig = retrievePackageProperty(packageProp, pkgConfig);
            if (potentiallyFoundConfig != null) {
              result.config = potentiallyFoundConfig;
              result.filepath = filepath;
              break dirLoop;
            }
            continue;
          }

          const isEmpty = !content.trim();
          if (isEmpty && ignoreEmptySearchPlaces) continue;

          if (isEmpty) {
            result.isEmpty = true;
            result.config = undefined;
          } else {
            checkLoader(loader, loaderKey);
            result.config = await loader(filepath, content);
          }
          result.filepath = filepath;
          break dirLoop;
        }

        if (currentDir === stopDir || currentDir === getParentDirectory(currentDir)) break dirLoop;
        currentDir = getParentDirectory(currentDir);
      }

      const finalResult = result.filepath || result.config ? transform(result) : transform(null);
      if (cache) visitedDirs.forEach((dir) => searchCache.set(dir, finalResult));
      return finalResult;
    },

    async load(filepath) {
      checkFilePath(filepath);
      const absolutePath = path.resolve(process.cwd(), filepath);
      if (cache && loadCache.has(absolutePath)) return loadCache.get(absolutePath);

      const { base, ext } = path.parse(absolutePath);
      const loaderKey = ext || 'noExt';
      const loader = loaders[loaderKey];

      checkLoader(loader, loaderKey);
      const content = (await fsPromises.readFile(absolutePath)).toString();

      if (base === 'package.json') {
        const packageConfig = await loader(absolutePath, content);
        return emplace(loadCache, absolutePath, transform({
          config: retrievePackageProperty(packageProp, packageConfig),
          filepath: absolutePath,
        }));
      }

      const configResult = { config: null, filepath: absolutePath };
      const isEmpty = !content.trim();
      if (isEmpty && ignoreEmptySearchPlaces) {
        return emplace(loadCache, absolutePath, transform({ filepath: absolutePath, config: undefined, isEmpty: true }));
      }

      configResult.config = isEmpty ? undefined : await loader(absolutePath, content);

      return emplace(loadCache, absolutePath, transform(isEmpty ? { ...configResult, isEmpty, config: undefined } : configResult));
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
};

module.exports.lilconfigSync = function lilconfigSync(name, options) {
  const {ignoreEmptySearchPlaces, loaders, packageProp, searchPlaces, stopDir, transform, cache} = configureOptions(name, options ?? {}, true);
  const searchCache = new Map();
  const loadCache = new Map();
  const emplace = createEmplaceFunction(cache);

  return {
    search(searchFrom = process.cwd()) {
      const result = { config: null, filepath: '' };
      const visitedDirs = new Set();
      let currentDir = searchFrom;

      dirLoop: while (true) {
        if (cache) {
          const cachedResult = searchCache.get(currentDir);
          if (cachedResult !== undefined) {
            visitedDirs.forEach((dir) => searchCache.set(dir, cachedResult));
            return cachedResult;
          }
          visitedDirs.add(currentDir);
        }

        for (const searchPlace of searchPlaces) {
          const filepath = path.resolve(currentDir, searchPlace);
          try {
            fs.accessSync(filepath);
          } catch {
            continue;
          }

          const content = fs.readFileSync(filepath).toString();
          const loaderKey = path.extname(searchPlace) || 'noExt';
          const loader = loaders[loaderKey];

          if (searchPlace === 'package.json') {
            const pkgConfig = loader(filepath, content);
            const potentiallyFoundConfig = retrievePackageProperty(packageProp, pkgConfig);
            if (potentiallyFoundConfig != null) {
              result.config = potentiallyFoundConfig;
              result.filepath = filepath;
              break dirLoop;
            }
            continue;
          }

          const isEmpty = !content.trim();
          if (isEmpty && ignoreEmptySearchPlaces) continue;

          if (isEmpty) {
            result.isEmpty = true;
            result.config = undefined;
          } else {
            checkLoader(loader, loaderKey);
            result.config = loader(filepath, content);
          }
          result.filepath = filepath;
          break dirLoop;
        }

        if (currentDir === stopDir || currentDir === getParentDirectory(currentDir)) break dirLoop;
        currentDir = getParentDirectory(currentDir);
      }

      const finalResult = result.filepath || result.config ? transform(result) : transform(null);
      if (cache) visitedDirs.forEach((dir) => searchCache.set(dir, finalResult));
      return finalResult;
    },

    load(filepath) {
      checkFilePath(filepath);
      const absolutePath = path.resolve(process.cwd(), filepath);
      if (cache && loadCache.has(absolutePath)) return loadCache.get(absolutePath);

      const { base, ext } = path.parse(absolutePath);
      const loaderKey = ext || 'noExt';
      const loader = loaders[loaderKey];

      checkLoader(loader, loaderKey);
      const content = fs.readFileSync(absolutePath).toString();

      if (base === 'package.json') {
        const packageConfig = loader(absolutePath, content);
        return transform({
          config: retrievePackageProperty(packageProp, packageConfig),
          filepath: absolutePath,
        });
      }

      const configResult = { config: null, filepath: absolutePath };
      const isEmpty = !content.trim();
      if (isEmpty && ignoreEmptySearchPlaces) {
        return emplace(loadCache, absolutePath, transform({ filepath: absolutePath, config: undefined, isEmpty: true }));
      }

      configResult.config = isEmpty ? undefined : loader(absolutePath, content);

      return emplace(loadCache, absolutePath, transform(isEmpty ? { ...configResult, isEmpty, config: undefined } : configResult));
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
};
