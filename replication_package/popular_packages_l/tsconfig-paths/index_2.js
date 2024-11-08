const fs = require('fs');
const path = require('path');

/**
 * Loads and returns TS config details from a given directory.
 * @param {string} cwd - Current working directory.
 * @returns {object} Loaded config result.
 */
function loadConfig(cwd = process.cwd()) {
  const configPath = path.resolve(cwd, 'tsconfig.json');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    const { baseUrl, paths } = config.compilerOptions || {};
    if (baseUrl && paths) {
      return { resultType: 'success', absoluteBaseUrl: path.resolve(cwd, baseUrl), paths };
    }
  }
  return { resultType: 'failed', message: `Cannot find tsconfig.json in ${cwd}` };
}

/**
 * Registers a custom module path resolver based on tsconfig paths.
 * @param {object} param0 - Configuration with baseUrl and paths.
 * @returns {Function} Function to restore original module resolution.
 */
function register({ baseUrl, paths }) {
  const originalResolveFilename = require('module')._resolveFilename;
  require('module')._resolveFilename = function (request, parent) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(request)) {
        const aliasedPaths = paths[alias];
        for (const aliasedPath of aliasedPaths) {
          const resolvedPath = path.resolve(baseUrl, aliasedPath.replace('*', request.replace(alias, '')));
          if (fs.existsSync(resolvedPath)) {
            return originalResolveFilename.call(this, resolvedPath, parent);
          }
        }
      }
    }
    return originalResolveFilename.call(this, request, parent);
  };
  return () => {
    require('module')._resolveFilename = originalResolveFilename;
  };
}

/**
 * Creates a synchronous function to match module paths.
 * @param {string} absoluteBaseUrl - Absolute base URL.
 * @param {object} paths - Paths configuration.
 * @param {Array} mainFields - Main fields in package.json to consider.
 * @param {boolean} addMatchAll - Whether to allow match-all patterns.
 * @returns {Function} Path matching function.
 */
function createMatchPath(absoluteBaseUrl, paths, mainFields = ["main"], addMatchAll = true) {
  return function matchPath(requestedModule) {
    for (const alias in paths) {
      if (new RegExp(`^${alias}`).test(requestedModule)) {
        const aliasedPaths = paths[alias];
        for (const aliasedPath of aliasedPaths) {
          const resolvedPath = path.resolve(absoluteBaseUrl, aliasedPath.replace('*', requestedModule.replace(alias, '')));
          if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
          }
        }
      }
    }
    return undefined;
  };
}

/**
 * Maps module paths from absolute mappings synchronously.
 * @param {Array} absolutePathMappings - Array of path mappings.
 * @param {string} requestedModule - Module name requested.
 * @param {Function} fileExists - Function to check file existence.
 * @returns {string|undefined} Resolved path.
 */
function matchFromAbsolutePaths(absolutePathMappings, requestedModule, fileExists = fs.existsSync) {
  for (const mapping of absolutePathMappings) {
    if (new RegExp(`^${mapping.alias}`).test(requestedModule)) {
      const mappedPaths = mapping.paths;
      for (const mappedPath of mappedPaths) {
        const resolvedPath = path.resolve(mapping.baseUrl, mappedPath.replace('*', requestedModule.replace(mapping.alias, '')));
        if (fileExists(resolvedPath)) {
          return resolvedPath;
        }
      }
    }
  }
  return undefined;
}

/**
 * Creates an asynchronous function to match module paths.
 * @param {...any} args - Arguments for creating matchPath function.
 * @returns {Function} Asynchronous matchPath function.
 */
function createMatchPathAsync(...args) {
  return function(requestedModule, callback) {
    const matchPath = createMatchPath(...args);
    const result = matchPath(requestedModule);
    process.nextTick(() => callback(null, result));
  };
}

/**
 * Maps module paths from absolute mappings asynchronously.
 * @param {Array} absolutePathMappings - Array of path mappings.
 * @param {string} requestedModule - Module name requested.
 * @param {Function} fileExists - Function to check file existence.
 * @param {Function} callback - Callback function.
 */
function matchFromAbsolutePathsAsync(absolutePathMappings, requestedModule, fileExists = fs.existsSync, callback) {
  const result = matchFromAbsolutePaths(absolutePathMappings, requestedModule, fileExists);
  process.nextTick(() => callback(null, result));
}

module.exports = {
  register,
  loadConfig,
  createMatchPath,
  matchFromAbsolutePaths,
  createMatchPathAsync,
  matchFromAbsolutePathsAsync,
};
```